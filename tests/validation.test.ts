import { describe, it, expect } from 'vitest'
import { normalizeMoroccanPhone, isDiscountValid } from '@/lib/validation'

describe('normalizeMoroccanPhone', () => {
  it('normalizes local format', () => {
    expect(normalizeMoroccanPhone('0671234567')).toBe('+212671234567')
    expect(normalizeMoroccanPhone('0712345678')).toBe('+212712345678')
  })
  it('accepts +212 format', () => {
    expect(normalizeMoroccanPhone('+212671234567')).toBe('+212671234567')
  })
  it('rejects invalid', () => {
    expect(normalizeMoroccanPhone('0512345678')).toBeNull()
  })
})

describe('isDiscountValid', () => {
  const now = new Date('2025-01-15')
  it('valid within window', () => {
    expect(isDiscountValid(now, new Date('2025-01-01'), new Date('2025-01-31'))).toBe(true)
  })
  it('invalid before window', () => {
    expect(isDiscountValid(now, new Date('2025-02-01'), new Date('2025-02-28'))).toBe(false)
  })
  it('invalid after window', () => {
    expect(isDiscountValid(now, new Date('2024-12-01'), new Date('2024-12-31'))).toBe(false)
  })
})
