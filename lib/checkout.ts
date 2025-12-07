import { z } from 'zod'
import { normalizePhone, isValidPostalCode } from '@/lib/utils'
import { validateDiscount } from '@/lib/discounts'

export const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().trim().min(6).max(30).transform(normalizePhone),
  address: z.string().trim().min(5).max(160),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().refine(isValidPostalCode, 'Code postal requis'),
  discountCode: z.string().trim().min(3).max(30).optional().or(z.literal('')),
})
  .transform(data => ({
    ...data,
    discountCode: data.discountCode ? data.discountCode.toUpperCase() : undefined,
  }))

export type CheckoutInput = z.infer<typeof checkoutSchema>

export interface ResolvedCheckout extends Omit<CheckoutInput, 'discountCode'> { discountPercent?: number; discountId?: string }

export async function resolveCheckout(input: CheckoutInput): Promise<{ ok: true; data: ResolvedCheckout } | { ok: false; fieldErrors: Record<string,string[]> }> {
  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string,string[]> = {}
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as string || '_'
      fieldErrors[path] = fieldErrors[path] ? [...fieldErrors[path], issue.message] : [issue.message]
    }
    return { ok: false, fieldErrors }
  }
  let discountPercent: number | undefined
  let discountId: string | undefined
  if (parsed.data.discountCode) {
    const validation = await validateDiscount(parsed.data.discountCode)
    if (validation.valid && validation.percent && validation.discount) {
      discountPercent = validation.percent
      discountId = validation.discount.id
    } else {
      // treat invalid discount as a field error
      return { ok: false, fieldErrors: { discountCode: ['Code promo invalide'] } }
    }
  }
  return { ok: true, data: { name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone, address: parsed.data.address, city: parsed.data.city, postalCode: parsed.data.postalCode, discountPercent, discountId } }
}
