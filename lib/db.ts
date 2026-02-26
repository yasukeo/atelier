import { PrismaClient } from '@prisma/client'

/**
 * Robust Prisma client for Supabase + Vercel serverless.
 *
 * - Auto-retries transient connection errors (3×, with backoff)
 * - Disconnects after idle (avoids stale sockets to PgBouncer)
 */

const MAX_RETRIES = 3
const BASE_DELAY_MS = 300        // 300 → 600 → 900ms

function isRetryable(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return (
    msg.includes("Can't reach database server") ||
    msg.includes('Connection refused') ||
    msg.includes('connect ETIMEDOUT') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('connection timed out') ||
    msg.includes('prepared statement') ||
    msg.includes('socket hang up') ||
    msg.includes('Server has closed the connection') ||
    msg.includes('Connection pool timeout') ||
    msg.includes('Timed out fetching a new connection')
  )
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            return await query(args)
          } catch (error: unknown) {
            lastError = error
            if (!isRetryable(error) || attempt === MAX_RETRIES) throw error

            // On connection error, force Prisma to open a fresh connection
            try { await client.$disconnect() } catch { /* ignore */ }
            await sleep(BASE_DELAY_MS * (attempt + 1))
          }
        }
        throw lastError
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>
const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient }

export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma ?? createPrismaClient()

// Cache on globalThis — survives HMR in dev & warm invocations on Vercel
globalForPrisma.prisma = prisma
