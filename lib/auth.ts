import type { NextAuthOptions, Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { mergeGuestCartIntoUser } from '@/lib/cart'
import { prisma } from '@/lib/db'
import { RATE_LIMITS, clearEvents, clientIp, isRateLimited, recordEvent } from '@/lib/rate-limit'

const credentialsSchema = z.object({
  // Registration stores emails lowercased, so normalize here too
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      async authorize(raw, req) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null
        const { email, password } = parsed.data

        // Brute-force protection: failed attempts are counted per account and per IP
        const emailKey = `login:email:${email}`
        const ipKey = `login:ip:${clientIp(req?.headers)}`
        const [emailLimited, ipLimited] = await Promise.all([
          isRateLimited(emailKey, RATE_LIMITS.loginPerEmail),
          isRateLimited(ipKey, RATE_LIMITS.loginPerIp),
        ])
        // The message reaches the sign-in page as res.error
        if (emailLimited || ipLimited) throw new Error('TooManyAttempts')

        const user = await prisma.user.findUnique({ where: { email } })
        const ok = user ? await bcrypt.compare(password, user.passwordHash) : false
        if (!user || !ok) {
          await recordEvent(emailKey, ipKey)
          return null
        }
        await clearEvents(emailKey)
        return { id: user.id, email: user.email, name: user.name ?? undefined, role: user.role as Role }
      },
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Merge guest cart cookie into persistent user cart
      try {
        if (user && user.id) {
          await mergeGuestCartIntoUser(user.id as string)
        }
      } catch (e) {
        // Non-fatal: log only in dev
        if (process.env.NODE_ENV !== 'production') console.error('mergeGuestCart failed', e)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user && 'role' in user) token.role = (user as { role?: Role }).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as Session["user"] & { role?: Role }).role = token.role as Role | undefined
      return session
    },
  },
}

export type Role = 'CUSTOMER' | 'ADMIN'
