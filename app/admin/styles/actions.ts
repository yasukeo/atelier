"use server"
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

const styleSchema = z.object({ name: z.string().min(1, 'Nom requis').max(100) })

export async function createStyle(formData: FormData) {
  await requireAdmin()
  const name = String(formData.get('name') || '').trim()
  const parsed = styleSchema.safeParse({ name })
  if (!parsed.success) {
    redirect('/admin/styles?error=invalid')
  }
  try {
    await prisma.style.create({ data: { name: parsed.data.name } })
    revalidatePath('/admin/styles')
    redirect('/admin/styles')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/styles?error=exists')
    redirect('/admin/styles?error=unknown')
  }
}

export async function updateStyle(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const parsed = styleSchema.safeParse({ name })
  if (!parsed.success || !id) {
    redirect('/admin/styles?error=invalid')
  }
  try {
    await prisma.style.update({ where: { id }, data: { name: parsed.data.name } })
    revalidatePath('/admin/styles')
    redirect('/admin/styles')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/styles?error=exists')
    redirect('/admin/styles?error=unknown')
  }
}

export async function deleteStyle(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/styles?error=invalid')
  try {
    await prisma.style.delete({ where: { id } })
    revalidatePath('/admin/styles')
    redirect('/admin/styles')
  } catch {
    // likely foreign key constraint
    redirect('/admin/styles?error=linked')
  }
}
