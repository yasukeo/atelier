import { prisma } from '@/lib/db'

/*
 * Fixed-window rate limiting stored in Postgres (RateLimitEvent), so it works across
 * serverless instances without an extra service. Fails open: if the table is missing
 * (migration not yet deployed) or the DB errors, requests are allowed rather than blocked.
 */

export type RateLimitRule = { limit: number; windowMs: number }

const MINUTE = 60_000
export const RATE_LIMITS = {
  loginPerEmail: { limit: 5, windowMs: 15 * MINUTE },
  loginPerIp: { limit: 20, windowMs: 15 * MINUTE },
  resetPerEmail: { limit: 3, windowMs: 60 * MINUTE },
  resetPerIp: { limit: 10, windowMs: 60 * MINUTE },
  registerPerIp: { limit: 10, windowMs: 60 * MINUTE },
  contactPerIp: { limit: 5, windowMs: 60 * MINUTE },
} satisfies Record<string, RateLimitRule>

let warned = false
function warn(e: unknown) {
  if (warned) return
  warned = true
  console.error('[rate-limit] disabled, database error (is the RateLimitEvent migration deployed?)', e)
}

/** True when `key` already has `limit` events within the window. */
export async function isRateLimited(key: string, rule: RateLimitRule): Promise<boolean> {
  try {
    const count = await prisma.rateLimitEvent.count({
      where: { key, createdAt: { gt: new Date(Date.now() - rule.windowMs) } },
    })
    return count >= rule.limit
  } catch (e) {
    warn(e)
    return false
  }
}

export async function recordEvent(...keys: string[]) {
  try {
    await prisma.rateLimitEvent.createMany({ data: keys.map(key => ({ key })) })
    // Occasional cleanup keeps the table small (longest window is 1h)
    if (Math.random() < 0.02) {
      await prisma.rateLimitEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * MINUTE) } } })
    }
  } catch (e) {
    warn(e)
  }
}

export async function clearEvents(key: string) {
  try {
    await prisma.rateLimitEvent.deleteMany({ where: { key } })
  } catch (e) {
    warn(e)
  }
}

type HeaderSource = Headers | Record<string, string | string[] | undefined>

/** Client IP as set by the hosting proxy (Vercel overwrites these headers, so they can't be spoofed there). */
export function clientIp(headers: HeaderSource | undefined): string {
  const get = (name: string) => {
    if (!headers) return undefined
    const v = headers instanceof Headers ? headers.get(name) : headers[name]
    return Array.isArray(v) ? v[0] : v ?? undefined
  }
  const ip = get('x-real-ip') || get('x-forwarded-for')?.split(',')[0]
  return ip?.trim() || 'unknown'
}
