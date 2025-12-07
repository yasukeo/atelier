"use server"
import { getCart, updateCartItem, removeCartItem } from '@/lib/cart'
import { validateDiscount } from '@/lib/discounts'
import { z } from 'zod'

export async function updateCartItemAction(input: { key: string; quantity: number; discountPercent?: number }) {
  await updateCartItem({ key: input.key, quantity: input.quantity })
  return getCart(input.discountPercent)
}

export async function removeCartItemAction(input: { key: string; discountPercent?: number }) {
  await removeCartItem({ key: input.key })
  return getCart(input.discountPercent)
}

export async function refreshCartAction(discountPercent?: number) {
  return getCart(discountPercent)
}

const discountSchema = z.object({ code: z.string().trim().min(3).max(30) })
export async function applyDiscountAction(raw: unknown) {
  const parsed = discountSchema.safeParse(raw)
  if (!parsed.success) return { ok: false as const, error: 'INVALID_INPUT' as const }
  const result = await validateDiscount(parsed.data.code)
  if (!result.valid || !result.percent) return { ok: false as const, error: result.reason ?? 'NOT_VALID' as const }
  const summary = await getCart(result.percent)
  return { ok: true as const, summary, percent: result.percent }
}
