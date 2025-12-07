import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Guest cart cookie constants
const CART_COOKIE = 'guest_cart_v1'
// We keep only minimal info in cookie: [{paintingId, widthCm, heightCm, quantity}]
// Price is always re-derived from DB to avoid tampering.

const cartItemCookieSchema = z.object({
  paintingId: z.string().cuid(),
  widthCm: z.number().int().positive().optional(),
  heightCm: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(20),
})
type CookieCartItem = z.infer<typeof cartItemCookieSchema>

async function readGuestCart(): Promise<CookieCartItem[]> {
  const store = await cookies()
  const raw = store.get(CART_COOKIE)?.value
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const validated: CookieCartItem[] = []
    for (const item of parsed) {
      const r = cartItemCookieSchema.safeParse(item)
      if (r.success) validated.push(r.data)
    }
    return validated
  } catch {
    return []
  }
}

async function writeGuestCart(items: CookieCartItem[]) {
  const store = await cookies()
  if (!items.length) {
    store.delete(CART_COOKIE)
    return
  }
  store.set(CART_COOKIE, JSON.stringify(items), { path: '/', httpOnly: false })
}

export interface CartLine {
  key: string // stable identifier (paintingId|width|height)
  paintingId: string
  title: string
  imageUrl: string | null
  widthCm?: number
  heightCm?: number
  unitPriceMAD: number
  quantity: number
  lineTotalMAD: number
}

export interface CartSummary {
  items: CartLine[]
  subtotalMAD: number
  discountPercent?: number
  discountAmountMAD?: number
  totalMAD: number
}

function lineKey(p: { paintingId: string; widthCm?: number; heightCm?: number }) {
  return [p.paintingId, p.widthCm ?? '-', p.heightCm ?? '-'].join('|')
}

export async function getCart(discountPercent?: number): Promise<CartSummary> {
  const session = await getServerSession(authOptions)
  let cartItems: { paintingId: string; widthCm?: number | null; heightCm?: number | null; quantity: number; unitPriceMAD: number }[] = []

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (user) {
      const dbItems = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { painting: { include: { images: true, recreationOptions: true } } }, orderBy: { createdAt: 'asc' } })
      cartItems = dbItems.map(ci => ({
        paintingId: ci.paintingId,
        widthCm: ci.widthCm ?? undefined,
        heightCm: ci.heightCm ?? undefined,
        quantity: ci.quantity,
        unitPriceMAD: ci.unitPriceMAD,
      }))
    }
  } else {
    const guest = await readGuestCart()
    // Rehydrate unitPrice from painting base or matching recreation option
    if (guest.length) {
      const paintingIds = [...new Set(guest.map(g => g.paintingId))]
      const paintings = await prisma.painting.findMany({ where: { id: { in: paintingIds } }, include: { images: true, recreationOptions: true } })
      for (const g of guest) {
        const p = paintings.find(p => p.id === g.paintingId)
        if (!p) continue
        let price = p.priceMAD
        if (g.widthCm && g.heightCm) {
          const opt = p.recreationOptions.find(o => o.widthCm === g.widthCm && o.heightCm === g.heightCm)
          if (opt) price = opt.priceMAD
        }
        cartItems.push({ paintingId: g.paintingId, widthCm: g.widthCm, heightCm: g.heightCm, quantity: g.quantity, unitPriceMAD: price })
      }
    }
  }

  // Aggregate by key (merge duplicates if any)
  const aggregated = new Map<string, { paintingId: string; widthCm?: number; heightCm?: number; quantity: number; unitPriceMAD: number }>()
  for (const item of cartItems) {
    const normalized = { paintingId: item.paintingId, widthCm: item.widthCm ?? undefined, heightCm: item.heightCm ?? undefined, quantity: item.quantity, unitPriceMAD: item.unitPriceMAD }
    const key = lineKey(normalized)
    const existing = aggregated.get(key)
    if (existing) existing.quantity += normalized.quantity
    else aggregated.set(key, normalized)
  }

  const lines: CartLine[] = []
  if (aggregated.size) {
    const ids = [...new Set([...aggregated.values()].map(v => v.paintingId))]
    const paintings = await prisma.painting.findMany({ where: { id: { in: ids } }, include: { images: true } })
    for (const value of aggregated.values()) {
      const p = paintings.find(pp => pp.id === value.paintingId)
      if (!p) continue
      const firstImg = p.images.sort((a,b)=> a.position - b.position)[0]
      const lineTotalMAD = value.unitPriceMAD * value.quantity
      lines.push({
        key: lineKey(value),
        paintingId: value.paintingId,
        title: p.title,
        imageUrl: firstImg?.url ?? null,
        widthCm: value.widthCm,
        heightCm: value.heightCm,
        unitPriceMAD: value.unitPriceMAD,
        quantity: value.quantity,
        lineTotalMAD,
      })
    }
  }

  const subtotalMAD = lines.reduce((s, l) => s + l.lineTotalMAD, 0)
  const discountAmountMAD = discountPercent ? Math.floor((subtotalMAD * discountPercent) / 100) : undefined
  const totalMAD = subtotalMAD - (discountAmountMAD ?? 0)
  return { items: lines, subtotalMAD, discountPercent, discountAmountMAD, totalMAD }
}

const addToCartSchema = z.object({
  paintingId: z.string().cuid(),
  widthCm: z.number().int().positive().optional(),
  heightCm: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(20).default(1),
})

export async function addToCart(raw: unknown) {
  const parsed = addToCartSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: 'INVALID_INPUT' as const }
  const { paintingId, widthCm, heightCm, quantity } = parsed.data
  const painting = await prisma.painting.findUnique({ where: { id: paintingId }, include: { recreationOptions: true } })
  if (!painting) return { ok: false as const, error: 'NOT_FOUND' as const }
  let unitPriceMAD = painting.priceMAD
  if (widthCm && heightCm) {
    const opt = painting.recreationOptions.find(o => o.widthCm === widthCm && o.heightCm === heightCm)
    if (!opt) return { ok: false as const, error: 'OPTION_NOT_FOUND' as const }
    unitPriceMAD = opt.priceMAD
  }
  const session = await getServerSession(authOptions)
  const isUnique = painting.kind === 'UNIQUE'
  const cappedQuantity = isUnique ? 1 : quantity
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user) return { ok: false as const, error: 'USER_NOT_FOUND' as const }
    // Upsert by composite uniqueness (simulate) for same variant
    const existing = await prisma.cartItem.findFirst({ where: { userId: user.id, paintingId, widthCm: widthCm ?? null, heightCm: heightCm ?? null } })
    if (existing) {
      const newQty = isUnique ? 1 : Math.min(20, existing.quantity + quantity)
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } })
    } else {
      await prisma.cartItem.create({ data: { userId: user.id, paintingId, widthCm, heightCm, unitPriceMAD, quantity: cappedQuantity } })
    }
  } else {
  const guest = await readGuestCart()
    const key = lineKey({ paintingId, widthCm, heightCm })
    const updated: CookieCartItem[] = []
    let merged = false
    for (const item of guest) {
      const k = lineKey(item)
      if (k === key) {
        const newQty = isUnique ? 1 : Math.min(20, item.quantity + quantity)
        updated.push({ ...item, quantity: newQty })
        merged = true
      } else updated.push(item)
    }
    if (!merged) updated.push({ paintingId, widthCm, heightCm, quantity: cappedQuantity })
    writeGuestCart(updated)
  }
  return { ok: true as const }
}

const updateCartItemSchema = z.object({ key: z.string(), quantity: z.number().int().min(1).max(20) })
export async function updateCartItem(raw: unknown) {
  const parsed = updateCartItemSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: 'INVALID_INPUT' as const }
  const { key, quantity } = parsed.data
  const [paintingId, widthStr, heightStr] = key.split('|')
  const widthCm = widthStr === '-' ? undefined : Number(widthStr)
  const heightCm = heightStr === '-' ? undefined : Number(heightStr)
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user) return { ok: false as const, error: 'USER_NOT_FOUND' as const }
    const existing = await prisma.cartItem.findFirst({ where: { userId: user.id, paintingId, widthCm: widthCm ?? null, heightCm: heightCm ?? null } })
    if (!existing) return { ok: false as const, error: 'NOT_FOUND' as const }
    // Enforce UNIQUE cap
    const painting = await prisma.painting.findUnique({ where: { id: paintingId }, select: { kind: true } })
    const enforcedQty = painting?.kind === 'UNIQUE' ? 1 : quantity
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: enforcedQty } })
  } else {
  const guest = await readGuestCart()
    const updated: CookieCartItem[] = []
    for (const item of guest) {
      const k = lineKey(item)
      if (k === key) {
        // Need painting kind to enforce; fetch once per match
        const painting = await prisma.painting.findUnique({ where: { id: paintingId }, select: { kind: true } })
        const enforcedQty = painting?.kind === 'UNIQUE' ? 1 : quantity
        updated.push({ ...item, quantity: enforcedQty })
      }
      else updated.push(item)
    }
    writeGuestCart(updated)
  }
  return { ok: true as const }
}

const removeCartItemSchema = z.object({ key: z.string() })
export async function removeCartItem(raw: unknown) {
  const parsed = removeCartItemSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: 'INVALID_INPUT' as const }
  const { key } = parsed.data
  const [paintingId, widthStr, heightStr] = key.split('|')
  const widthCm = widthStr === '-' ? undefined : Number(widthStr)
  const heightCm = heightStr === '-' ? undefined : Number(heightStr)
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user) return { ok: false as const, error: 'USER_NOT_FOUND' as const }
    const existing = await prisma.cartItem.findFirst({ where: { userId: user.id, paintingId, widthCm: widthCm ?? null, heightCm: heightCm ?? null } })
    if (!existing) return { ok: false as const, error: 'NOT_FOUND' as const }
    await prisma.cartItem.delete({ where: { id: existing.id } })
  } else {
    const guest = await readGuestCart()
    const filtered = guest.filter((i: CookieCartItem) => lineKey(i) !== key)
    await writeGuestCart(filtered)
  }
  return { ok: true as const }
}

// Merge guest cart into user cart after login (call this post-auth once) and clear cookie
export async function mergeGuestCartIntoUser(userId: string) {
  const guest = await readGuestCart()
  if (!guest.length) return { merged: 0 }
  let mergedCount = 0
  for (const g of guest) {
    const existing = await prisma.cartItem.findFirst({ where: { userId, paintingId: g.paintingId, widthCm: g.widthCm ?? null, heightCm: g.heightCm ?? null } })
    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: Math.min(20, existing.quantity + g.quantity) } })
    } else {
      // Need price; re-fetch price logic to avoid trusting cookie
      const painting = await prisma.painting.findUnique({ where: { id: g.paintingId }, include: { recreationOptions: true } })
      if (!painting) continue
      let unitPriceMAD = painting.priceMAD
      if (g.widthCm && g.heightCm) {
        const opt = painting.recreationOptions.find(o => o.widthCm === g.widthCm && o.heightCm === g.heightCm)
        if (opt) unitPriceMAD = opt.priceMAD
      }
      await prisma.cartItem.create({ data: { userId, paintingId: g.paintingId, widthCm: g.widthCm, heightCm: g.heightCm, unitPriceMAD, quantity: g.quantity } })
    }
    mergedCount++
  }
  writeGuestCart([])
  return { merged: mergedCount }
}

// Clear all cart items for a user (after successful order)
export async function clearUserCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { userId } })
}
