"use server"
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nom trop court (min 2 caractères)').max(80),
  email: z.string().trim().email('Email invalide').toLowerCase(),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)').max(100),
})

export async function registerUser(formData: FormData) {
  const raw = {
    name: String(formData.get('name') || ''),
    email: String(formData.get('email') || ''),
    password: String(formData.get('password') || ''),
  }
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    // Build a descriptive error from Zod issues
    const msg = parsed.error.issues.map(i => i.message).join(', ')
    redirect(`/signin?error=validation&msg=${encodeURIComponent(msg)}`)
  }
  const { name, email, password } = parsed.data

  // Check for existing user first (before any redirect that could throw)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    redirect('/signin?error=exists')
  }

  // Attempt to create the user
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name, email, passwordHash } })
  } catch (err) {
    // Prisma unique constraint error (P2002) means email already exists
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
      redirect('/signin?error=exists')
    }
    redirect('/signin?error=unknown')
  }

  // Success - redirect outside try/catch so Next.js redirect exception isn't caught
  redirect('/signin?success=registered')
}
