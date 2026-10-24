import { describe, it, expect, vi, beforeEach } from 'vitest'

// validateDiscount calls getResolvedDiscount internally, so spying on the module export
// can't intercept it: mock the Prisma client instead.
const findUnique = vi.fn()
vi.mock('@/lib/db', () => ({ prisma: { discountCode: { findUnique: (...args: unknown[]) => findUnique(...args) } } }))

import * as discounts from '@/lib/discounts'

const day = 24 * 60 * 60 * 1000
function discountRow(overrides: Partial<{ code: string; percent: number; startsAt: Date | null; endsAt: Date | null }> = {}) {
  return { id: 'd1', code: 'CODE', percent: 10, startsAt: null, endsAt: null, createdAt: new Date(), updatedAt: new Date(), orders: [], ...overrides }
}

describe('Discount logic', () => {
  beforeEach(() => {
    findUnique.mockReset()
  })

  it('resolves ACTIVE status', () => {
    const now = new Date()
    expect(discounts.resolveDiscountStatus({ startsAt: null, endsAt: null })).toBe('ACTIVE')
    expect(discounts.resolveDiscountStatus({ startsAt: new Date(now.getTime() - 1000), endsAt: null })).toBe('ACTIVE')
    expect(discounts.resolveDiscountStatus({ startsAt: null, endsAt: new Date(now.getTime() + 100000) })).toBe('ACTIVE')
  })

  it('resolves FUTURE status', () => {
    const future = new Date(Date.now() + 1000000)
    expect(discounts.resolveDiscountStatus({ startsAt: future, endsAt: null })).toBe('FUTURE')
  })

  it('resolves EXPIRED status', () => {
    const past = new Date(Date.now() - 1000000)
    expect(discounts.resolveDiscountStatus({ startsAt: null, endsAt: past })).toBe('EXPIRED')
  })

  it('validateDiscount returns NOT_FOUND for missing code', async () => {
    findUnique.mockResolvedValue(null)
    const result = await discounts.validateDiscount('NOPE')
    expect(result).toEqual({ valid: false, reason: 'NOT_FOUND' })
  })

  it('looks codes up uppercased', async () => {
    findUnique.mockResolvedValue(null)
    await discounts.validateDiscount('bienvenue10')
    expect(findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { code: 'BIENVENUE10' } }))
  })

  it('validateDiscount rejects expired codes', async () => {
    findUnique.mockResolvedValue(discountRow({ code: 'EXPIRED', endsAt: new Date(Date.now() - day) }))
    const result = await discounts.validateDiscount('EXPIRED')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('EXPIRED')
  })

  it('validateDiscount rejects codes that have not started', async () => {
    findUnique.mockResolvedValue(discountRow({ code: 'FUTURE', startsAt: new Date(Date.now() + day) }))
    const result = await discounts.validateDiscount('FUTURE')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('FUTURE')
  })

  it('validateDiscount returns the percent for ACTIVE codes', async () => {
    findUnique.mockResolvedValue(discountRow({ code: 'ACTIVE', percent: 20 }))
    const result = await discounts.validateDiscount('ACTIVE')
    expect(result.valid).toBe(true)
    expect(result.percent).toBe(20)
    expect(result.discount?.status).toBe('ACTIVE')
  })
})
