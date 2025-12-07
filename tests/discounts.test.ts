import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as discounts from '../lib/discounts'

describe('Discount logic', () => {
  beforeEach(() => {
    vi.resetAllMocks()
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
    vi.spyOn(discounts, 'getResolvedDiscount').mockResolvedValue(null)
    const result = await discounts.validateDiscount('NOPE')
    expect(result).toEqual({ valid: false, reason: 'NOT_FOUND' })
  })

  it('validateDiscount returns correct status for expired', async () => {
    vi.spyOn(discounts, 'getResolvedDiscount').mockResolvedValue({
      id: '1', code: 'EXPIRED', percent: 10, startsAt: null, endsAt: null, status: 'EXPIRED', usageCount: 0, appliedPercent: 0
    })
    const result = await discounts.validateDiscount('EXPIRED')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('EXPIRED')
  })

  it('validateDiscount returns correct status for future', async () => {
    vi.spyOn(discounts, 'getResolvedDiscount').mockResolvedValue({
      id: '2', code: 'FUTURE', percent: 10, startsAt: null, endsAt: null, status: 'FUTURE', usageCount: 0, appliedPercent: 0
    })
    const result = await discounts.validateDiscount('FUTURE')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('FUTURE')
  })

  it('validateDiscount returns valid for ACTIVE', async () => {
    vi.spyOn(discounts, 'getResolvedDiscount').mockResolvedValue({
      id: '3', code: 'ACTIVE', percent: 20, startsAt: null, endsAt: null, status: 'ACTIVE', usageCount: 0, appliedPercent: 20
    })
    const result = await discounts.validateDiscount('ACTIVE')
    expect(result.valid).toBe(true)
    expect(result.percent).toBe(20)
    expect(result.discount?.status).toBe('ACTIVE')
  })
})
