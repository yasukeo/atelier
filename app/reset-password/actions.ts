"use server"
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export async function resetPassword(formData: FormData) {
  const token = String(formData.get('token') || '')
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirmPassword') || '')

  // Validate passwords match
  if (password !== confirmPassword) {
    redirect(`/reset-password?token=${token}&error=mismatch`)
  }

  const parsed = schema.safeParse({ token, password })
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || 'invalid'
    redirect(`/reset-password?token=${token}&error=${encodeURIComponent(errorMsg)}`)
  }

  // Find the token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

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

  // Update user password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: hashedPassword },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ])

  redirect('/signin?success=password-reset')
}
