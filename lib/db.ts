import { PrismaClient } from '@prisma/client'

/**
 * Retry-enabled Prisma client.
 *
 * Supabase PgBouncer drops connections intermittently on serverless (Vercel).
 * We wrap every query in an automatic retry (up to 3 attempts with backoff)
 * so transient connection failures don't crash the page.
 */

const MAX_RETRIES = 3
const BASE_DELAY_MS = 400

function createPrismaClient() {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown
        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            return await query(args)
          } catch (error: unknown) {
            lastError = error
            if (attempt === MAX_RETRIES) break

            // Only retry on transient connection errors
            const msg = (error instanceof Error ? error.message : String(error))
            const retryable =
              msg.includes("Can't reach database server") ||
              msg.includes('Connection refused') ||
              msg.includes('connect ETIMEDOUT') ||
              msg.includes('ECONNRESET') ||
              msg.includes('ECONNREFUSED') ||
              msg.includes('connection timed out') ||
              msg.includes('prepared statement') ||
              msg.includes('socket hang up') ||
              msg.includes('Server has closed the connection')

            if (!retryable) throw error

            // Exponential back-off: 400ms → 800ms → 1200ms
            await new Promise((r) => setTimeout(r, BASE_DELAY_MS * (attempt + 1)))
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
