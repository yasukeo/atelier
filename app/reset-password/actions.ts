"use server"
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { hashToken } from '@/lib/tokens'
import { clearEvents } from '@/lib/rate-limit'

const schema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(6).max(100),
})

export async function resetPassword(formData: FormData) {
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')
  const tokenParam = encodeURIComponent(token)

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${tokenParam}&error=mismatch`)
  }

  const parsed = schema.safeParse({ token, password })
  if (!parsed.success) {
    redirect(`/reset-password?token=${tokenParam}&error=invalid-password`)
  }

  // Find the token
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: hashToken(token) } })

  if (!resetToken) {
    redirect('/reset-password?error=invalid-token')
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    redirect('/reset-password?error=expired')
  }

  // Check if token was already used
  if (resetToken.usedAt) {
    redirect('/reset-password?error=used')
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Consume the token atomically: if two requests race with the same link, only one changes the password
  const consumed = await prisma.$transaction(async (tx) => {
    const claim = await tx.passwordResetToken.updateMany({
      where: { id: resetToken.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    })
    if (claim.count !== 1) return null
    return tx.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
      select: { email: true },
    })
  })

  if (!consumed) {
    redirect('/reset-password?error=used')
  }

  // The owner proved access to the mailbox: lift any brute-force lock on the account
  await clearEvents(`login:email:${consumed.email}`)

  redirect('/signin?success=password-reset')
}
