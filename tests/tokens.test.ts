// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { generateToken, hashToken } from '@/lib/tokens'

describe('generateToken', () => {
  it('returns 64 hex chars, different each time', () => {
    const a = generateToken()
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(generateToken()).not.toBe(a)
  })
})

describe('hashToken', () => {
  it('is deterministic and never returns the token itself', () => {
    const token = generateToken()
    expect(hashToken(token)).toBe(hashToken(token))
    expect(hashToken(token)).not.toBe(token)
    expect(hashToken(token)).toMatch(/^[0-9a-f]{64}$/)
  })
})
