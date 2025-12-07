import { prisma } from '@/lib/db'

export type DiscountStatus = 'ACTIVE' | 'FUTURE' | 'EXPIRED' | 'INACTIVE' | 'EXHAUSTED'

export interface ResolvedDiscount {
  id: string
  code: string
  percent: number
  startsAt: Date | null
  endsAt: Date | null
  status: DiscountStatus
  usageCount: number
  appliedPercent: number
}

// Derive status from temporal bounds and (future extension) max uses, disabled flag, etc.
export function resolveDiscountStatus(d: { startsAt: Date | null; endsAt: Date | null }): DiscountStatus {
  const now = new Date()
  if (d.startsAt && d.startsAt > now) return 'FUTURE'
  if (d.endsAt && d.endsAt < now) return 'EXPIRED'
  return 'ACTIVE'
}

export async function getResolvedDiscount(code: string): Promise<ResolvedDiscount | null> {
  const discount = await prisma.discountCode.findUnique({ where: { code: code.toUpperCase() }, include: { orders: true } })
  if (!discount) return null
  const status = resolveDiscountStatus({ startsAt: discount.startsAt ?? null, endsAt: discount.endsAt ?? null })
  const usageCount = discount.orders.length
  return {
    id: discount.id,
    code: discount.code,
    percent: discount.percent,
    startsAt: discount.startsAt ?? null,
    endsAt: discount.endsAt ?? null,
    status,
    usageCount,
    appliedPercent: status === 'ACTIVE' ? discount.percent : 0,
  }
}

export interface ValidateDiscountResult {
  valid: boolean
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'FUTURE' | 'INACTIVE' | 'EXHAUSTED'
  percent?: number
  discount?: ResolvedDiscount
}

export async function validateDiscount(code: string): Promise<ValidateDiscountResult> {
  const resolved = await getResolvedDiscount(code)
  if (!resolved) return { valid: false, reason: 'NOT_FOUND' }
  switch (resolved.status) {
    case 'EXPIRED':
      return { valid: false, reason: 'EXPIRED', discount: resolved }
    case 'FUTURE':
      return { valid: false, reason: 'FUTURE', discount: resolved }
    case 'INACTIVE':
      return { valid: false, reason: 'INACTIVE', discount: resolved }
    case 'EXHAUSTED':
      return { valid: false, reason: 'EXHAUSTED', discount: resolved }
    case 'ACTIVE':
    default:
      return { valid: true, percent: resolved.appliedPercent, discount: resolved }
  }
}
