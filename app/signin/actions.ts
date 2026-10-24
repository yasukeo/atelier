"use server"
import { prisma } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { safeCallbackUrl } from '@/lib/format'

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
  // Keep the post-login destination (e.g. /checkout) across the register → sign-in redirects
  const callbackUrl = safeCallbackUrl(String(formData.get('callbackUrl') || ''), '')
  const keep = callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ''
  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    // Pass the invalid field names; the page turns them into messages
    const fields = [...new Set(parsed.error.issues.map(i => String(i.path[0])))].join(',')
    redirect(`/signin?tab=register&error=validation&fields=${encodeURIComponent(fields)}${keep}`)
  }
  const { name, email, password } = parsed.data

  // Check for existing user first (before any redirect that could throw)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    redirect(`/signin?tab=register&error=exists${keep}`)
  }

  // Attempt to create the user
  try {
    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.user.create({ data: { name, email, passwordHash } })
  } catch (err) {
    // Prisma unique constraint error (P2002) means email already exists
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'P2002') {
      redirect(`/signin?tab=register&error=exists${keep}`)
    }
    redirect(`/signin?tab=register&error=unknown${keep}`)
  }

  // Success - redirect outside try/catch so Next.js redirect exception isn't caught
  redirect(`/signin?success=registered${keep}`)
}
