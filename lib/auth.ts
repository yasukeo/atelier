import type { NextAuthOptions, Session } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { mergeGuestCartIntoUser } from '@/lib/cart'

const prisma = new PrismaClient()

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Credentials',
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null
        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null
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
