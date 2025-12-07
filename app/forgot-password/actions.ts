"use server"
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { sendPasswordResetEmail } from '@/lib/email'

const schema = z.object({ email: z.string().email() })

export async function requestPasswordReset(formData: FormData) {
  const rawEmail = String(formData.get('email') || '').toLowerCase().trim()
  const parsed = schema.safeParse({ email: rawEmail })
  if (!parsed.success) redirect('/forgot-password?error=invalid')
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  // Always redirect success to avoid user enumeration timing differences
  if (!user) redirect('/forgot-password?success=1')

  // Invalidate previous unused tokens (optional cleanup)
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } })

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 minutes
  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } })

  // Send password reset email via Resend
  try {
    await sendPasswordResetEmail(user.email, token, user.name || undefined)
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    // Still redirect to success to avoid user enumeration
  }

  redirect('/forgot-password?success=1')
}
