// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const db = vi.hoisted(() => ({
  rateLimitEvent: { count: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn() },
}))
vi.mock('@/lib/db', () => ({ prisma: db }))

import { clientIp, isRateLimited, recordEvent } from '@/lib/rate-limit'

beforeEach(() => vi.clearAllMocks())

describe('clientIp', () => {
  it('prefers x-real-ip, then the first x-forwarded-for entry', () => {
    expect(clientIp(new Headers({ 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('1.1.1.1')
    expect(clientIp({ 'x-forwarded-for': '3.3.3.3, 10.0.0.1' })).toBe('3.3.3.3')
  })

  it('falls back to "unknown"', () => {
    expect(clientIp(undefined)).toBe('unknown')
    expect(clientIp({})).toBe('unknown')
  })
})

describe('isRateLimited', () => {
  const rule = { limit: 5, windowMs: 60_000 }

  it('blocks once the limit is reached within the window', async () => {
    db.rateLimitEvent.count.mockResolvedValueOnce(4)
    expect(await isRateLimited('k', rule)).toBe(false)
    db.rateLimitEvent.count.mockResolvedValueOnce(5)
    expect(await isRateLimited('k', rule)).toBe(true)
    const where = db.rateLimitEvent.count.mock.calls[0][0].where
    expect(where.key).toBe('k')
    expect(Date.now() - where.createdAt.gt.getTime()).toBeGreaterThanOrEqual(60_000)
  })

  it('fails open when the database errors (e.g. migration not deployed)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    db.rateLimitEvent.count.mockRejectedValueOnce(new Error('relation "RateLimitEvent" does not exist'))
    expect(await isRateLimited('k', rule)).toBe(false)
    db.rateLimitEvent.createMany.mockRejectedValueOnce(new Error('boom'))
    await expect(recordEvent('k')).resolves.toBeUndefined()
  })
})
