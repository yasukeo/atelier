"use server"
import { getCart } from '@/lib/cart'
import { resolveCheckout } from '@/lib/checkout'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendOrderConfirmation } from '@/lib/email'
import { formatDimensions } from '@/lib/format'
import { revalidatePath } from 'next/cache'

class UniquePieceSoldError extends Error {}

export async function placeOrderAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return { ok: false as const, error: 'AUTH_REQUIRED' as const }
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
  if (!user) return { ok: false as const, error: 'USER_NOT_FOUND' as const }

  const raw = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    phone: String(formData.get('phone') || ''),
    address: String(formData.get('address') || ''),
    city: String(formData.get('city') || ''),
    postalCode: String(formData.get('postalCode') || ''),
    discountCode: String(formData.get('discountCode') || '').trim() || undefined,
  }
  const resolved = await resolveCheckout(raw)
  if (!resolved.ok) return { ok: false as const, error: 'VALIDATION', fieldErrors: resolved.fieldErrors }

  const cart = await getCart(resolved.data.discountPercent)
  if (cart.items.length === 0) return { ok: false as const, error: 'EMPTY_CART' as const }
  if (cart.hasUnavailable) return { ok: false as const, error: 'UNAVAILABLE' as const }

  const subtotal = cart.subtotalMAD
  const discountAmount = cart.discountAmountMAD ?? 0
  const total = cart.totalMAD

  // Persist order transactionally
  let order
  try {
    order = await prisma.$transaction(async (tx) => {
      const paintingIds = [...new Set(cart.items.map(i => i.paintingId))]
      const paintings = await tx.painting.findMany({
        where: { id: { in: paintingIds } },
        select: { id: true, kind: true, widthCm: true, heightCm: true },
      })
      const paintingMap = new Map(paintings.map(p => [p.id, p]))

      // Reserve UNIQUE pieces atomically: only rows still available are flipped, so two
      // customers checking out the same original at once cannot both succeed.
      const uniqueIds = paintings.filter(p => p.kind === 'UNIQUE').map(p => p.id)
      if (uniqueIds.length) {
        const reserved = await tx.painting.updateMany({
          where: { id: { in: uniqueIds }, available: true },
          data: { available: false },
        })
        if (reserved.count !== uniqueIds.length) throw new UniquePieceSoldError()
      }

      const created = await tx.order.create({
        data: {
          customerId: user.id,
          totalMAD: total,
          shippingFeeMAD: 0,
          discountCodeId: resolved.data.discountId ?? null,
          phone: resolved.data.phone,
          postalCode: resolved.data.postalCode,
          addressLine1: resolved.data.address,
          city: resolved.data.city,
          country: 'MA',
          status: 'PENDING_REVIEW',
        },
      })
      await tx.orderStatusHistory.create({ data: { orderId: created.id, status: 'PENDING_REVIEW', note: 'Commande créée' } })
      await tx.orderItem.createMany({
        data: cart.items.map(i => {
          const painting = paintingMap.get(i.paintingId)
          return {
            orderId: created.id,
            paintingId: i.paintingId,
            // Use cart item dimensions if specified, otherwise fall back to painting's own dimensions
            widthCm: i.widthCm ?? painting?.widthCm ?? 0,
            heightCm: i.heightCm ?? painting?.heightCm ?? 0,
            unitPriceMAD: i.unitPriceMAD,
            quantity: i.quantity,
          }
        }),
      })
      // Clear user cart
      await tx.cartItem.deleteMany({ where: { userId: user.id } })
      return created
    })
  } catch (e) {
    if (e instanceof UniquePieceSoldError) return { ok: false as const, error: 'UNAVAILABLE' as const }
    throw e
  }

  // Sold originals disappear from the public pages
  revalidatePath('/')
  revalidatePath('/paintings')
  for (const item of cart.items) revalidatePath(`/paintings/${item.paintingId}`)

  // Send confirmation email (async, non-blocking)
  sendOrderConfirmation(raw.email, {
    orderId: order.id,
    customerName: raw.name,
    items: cart.items.map(i => ({
      title: i.title,
      quantity: i.quantity,
      unitPrice: i.unitPriceMAD,
      dimensions: i.widthCm && i.heightCm ? formatDimensions(i.widthCm, i.heightCm) : undefined,
    })),
    subtotal: subtotal,
    discount: raw.discountCode && cart.discountPercent
      ? { code: raw.discountCode.toUpperCase(), percent: cart.discountPercent, amount: discountAmount }
      : undefined,
    shippingFee: 0,
    total: total,
    address: `${raw.address}, ${raw.city} ${raw.postalCode}`,
    phone: resolved.data.phone,
  }).catch((err) => console.error('Failed to send order confirmation email:', err))

  return { ok: true as const, orderId: order.id, totalMAD: total, subtotalMAD: subtotal, discountAmountMAD: discountAmount }
}
