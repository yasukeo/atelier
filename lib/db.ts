import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function buildDatabaseUrl() {
  const url = process.env.DATABASE_URL ?? ''
  // Supabase PgBouncer (port 6543) requires pgbouncer=true to disable prepared statements
  if (url.includes(':6543') && !url.includes('pgbouncer=true')) {
    return url.includes('?') ? `${url}&pgbouncer=true` : `${url}?pgbouncer=true`
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? [] : ['query', 'error', 'warn'],
    datasources: { db: { url: buildDatabaseUrl() } },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
