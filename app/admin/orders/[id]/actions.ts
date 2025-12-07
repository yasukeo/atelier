"use server"
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { sendOrderStatusUpdate } from '@/lib/email'

const updateStatusSchema = z.object({ orderId: z.string().cuid(), status: z.enum(['PENDING_REVIEW','IN_PROGRESS','READY_FOR_DELIVERY','COMPLETED','CANCELED']) })

export async function updateOrderStatusAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') return { ok:false as const, error:'UNAUTHORIZED' as const }
  const raw = { orderId: String(formData.get('orderId')||''), status: String(formData.get('status')||'') }
  const parsed = updateStatusSchema.safeParse(raw)
  if (!parsed.success) return { ok:false as const, error:'INVALID_INPUT' as const }
  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } })
  if (!order) return { ok:false as const, error:'NOT_FOUND' as const }
  if (order.status === parsed.data.status) return { ok:true as const, unchanged:true as const }
  // Fetch customer info for email
  const customer = await prisma.user.findUnique({ where: { id: order.customerId }, select: { email: true, name: true } })
  
  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({ where: { id: order.id }, data: { status: parsed.data.status } })
    await tx.orderStatusHistory.create({ data: { orderId: order.id, status: parsed.data.status, note: 'Mise à jour admin' } })
    return o
  })

  // Send status update email (async, non-blocking)
  if (customer?.email) {
    sendOrderStatusUpdate(
      customer.email,
      order.id,
      parsed.data.status,
      customer.name || undefined
    ).catch((err) => console.error('Failed to send order status update email:', err))
  }

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${order.id}`)
  return { ok:true as const, status: updated.status }
}
