"use server"
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

const artistSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(200),
  bio: z.string().max(2000).optional(),
})

export async function createArtist(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  const bio = String(formData.get('bio') || '').trim() || undefined
  const parsed = artistSchema.safeParse({ name, bio })
  if (!parsed.success) redirect('/admin/artists?error=invalid')
  try {
    await prisma.artist.create({ data: parsed.data })
    revalidatePath('/admin/artists')
    redirect('/admin/artists')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/artists?error=exists')
    redirect('/admin/artists?error=unknown')
  }
}

export async function updateArtist(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const bio = String(formData.get('bio') || '').trim() || undefined
  const parsed = artistSchema.safeParse({ name, bio })
  if (!parsed.success || !id) redirect('/admin/artists?error=invalid')
  try {
    await prisma.artist.update({ where: { id }, data: parsed.data })
    revalidatePath('/admin/artists')
    redirect('/admin/artists')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/artists?error=exists')
    redirect('/admin/artists?error=unknown')
  }
}

export async function deleteArtist(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/artists?error=invalid')
  try {
    await prisma.artist.delete({ where: { id } })
    revalidatePath('/admin/artists')
    redirect('/admin/artists')
  } catch {
    redirect('/admin/artists?error=linked')
  }
}
