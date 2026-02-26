import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })

// Always cache on globalThis:
// - In dev: survives HMR module reloads
// - On Vercel: reused across warm invocations of the same function instance
globalForPrisma.prisma = prisma
