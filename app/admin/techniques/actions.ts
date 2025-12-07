"use server"
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

const techniqueSchema = z.object({ name: z.string().min(1, 'Nom requis').max(100) })

export async function createTechnique(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  const parsed = techniqueSchema.safeParse({ name })
  if (!parsed.success) {
    redirect('/admin/techniques?error=invalid')
  }
  try {
    await prisma.technique.create({ data: { name: parsed.data.name } })
    revalidatePath('/admin/techniques')
    redirect('/admin/techniques')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/techniques?error=exists')
    redirect('/admin/techniques?error=unknown')
  }
}

export async function updateTechnique(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const parsed = techniqueSchema.safeParse({ name })
  if (!parsed.success || !id) {
    redirect('/admin/techniques?error=invalid')
  }
  try {
    await prisma.technique.update({ where: { id }, data: { name: parsed.data.name } })
    revalidatePath('/admin/techniques')
    redirect('/admin/techniques')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/techniques?error=exists')
    redirect('/admin/techniques?error=unknown')
  }
}

export async function deleteTechnique(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/techniques?error=invalid')
  try {
    await prisma.technique.delete({ where: { id } })
    revalidatePath('/admin/techniques')
    redirect('/admin/techniques')
  } catch {
    // likely foreign key constraint
    redirect('/admin/techniques?error=linked')
  }
}
