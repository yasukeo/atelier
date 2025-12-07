"use server"
import { z } from 'zod'
import { validateDiscount } from '@/lib/discounts'

const discountCodeSchema = z.object({ code: z.string().trim().min(3).max(30) })

export async function validateDiscountCode(formData: FormData) {
  const code = String(formData.get('code') || '').trim()
  const parsed = discountCodeSchema.safeParse({ code })
  if (!parsed.success) {
    return { valid: false, reason: 'INVALID_FORMAT' as const }
  }
  const result = await validateDiscount(parsed.data.code)
  return result
}
