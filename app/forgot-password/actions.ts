"use server"
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { generateToken, hashToken } from '@/lib/tokens'
import { z } from 'zod'
import { sendPasswordResetEmail } from '@/lib/email'
import { headers } from 'next/headers'
import { RATE_LIMITS, clientIp, isRateLimited, recordEvent } from '@/lib/rate-limit'

const schema = z.object({ email: z.string().email() })

export async function requestPasswordReset(formData: FormData) {
  const rawEmail = String(formData.get('email') || '').toLowerCase().trim()
  const parsed = schema.safeParse({ email: rawEmail })
  if (!parsed.success) redirect('/forgot-password?error=invalid')

  // Stops this form from being used to flood someone's inbox. Same success page either way, so nothing is revealed
  const emailKey = `reset:email:${parsed.data.email}`
  const ipKey = `reset:ip:${clientIp(await headers())}`
  const [emailLimited, ipLimited] = await Promise.all([
    isRateLimited(emailKey, RATE_LIMITS.resetPerEmail),
    isRateLimited(ipKey, RATE_LIMITS.resetPerIp),
  ])
  if (emailLimited || ipLimited) redirect('/forgot-password?success=1')
  await recordEvent(emailKey, ipKey)

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  // Always redirect success to avoid user enumeration timing differences
  if (!user) redirect('/forgot-password?success=1')

  // Invalidate previous unused tokens (optional cleanup)
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } })

  const token = generateToken()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
  // Only the hash is stored; the plain token goes in the email link
  await prisma.passwordResetToken.create({ data: { userId: user.id, token: hashToken(token), expiresAt } })

  // Send password reset email via Resend
  try {
    await sendPasswordResetEmail(user.email, token, user.name || undefined)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    // Still redirect to success to avoid user enumeration
  }

  redirect('/forgot-password?success=1')
}
