"use server"
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

const discountSchema = z.object({
  code: z.string().trim().min(3).max(30).regex(/^[A-Z0-9_-]+$/i, 'Code invalide'),
  percent: z.coerce.number().int().min(1).max(90),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

function parseDates(startsAt?: string, endsAt?: string) {
  const s = startsAt ? new Date(startsAt) : null
  const e = endsAt ? new Date(endsAt) : null
  if (s && e && e < s) return { error: true as const }
  return { startsAt: s, endsAt: e, error: false as const }
}

export async function createDiscount(formData: FormData) {
  await requireAdmin()
  const raw = {
    code: String(formData.get('code') || ''),
    percent: formData.get('percent'),
    startsAt: String(formData.get('startsAt') || ''),
    endsAt: String(formData.get('endsAt') || ''),
  }
  const parsed = discountSchema.safeParse(raw)
  if (!parsed.success) redirect('/admin/discounts?error=invalid')
  const dates = parseDates(parsed.data.startsAt, parsed.data.endsAt)
  if (dates.error) redirect('/admin/discounts?error=range')
  try {
    await prisma.discountCode.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        percent: parsed.data.percent,
        startsAt: dates.startsAt ?? undefined,
        endsAt: dates.endsAt ?? undefined,
      },
    })
    revalidatePath('/admin/discounts')
    redirect('/admin/discounts?success=created')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/discounts?error=exists')
    redirect('/admin/discounts?error=unknown')
  }
}

export async function updateDiscount(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const raw = {
    code: String(formData.get('code') || ''),
    percent: formData.get('percent'),
    startsAt: String(formData.get('startsAt') || ''),
    endsAt: String(formData.get('endsAt') || ''),
  }
  if (!id) redirect('/admin/discounts?error=invalid')
  const parsed = discountSchema.safeParse(raw)
  if (!parsed.success) redirect('/admin/discounts?error=invalid')
  const dates = parseDates(parsed.data.startsAt, parsed.data.endsAt)
  if (dates.error) redirect('/admin/discounts?error=range')
  try {
    await prisma.discountCode.update({
      where: { id },
      data: {
        code: parsed.data.code.toUpperCase(),
        percent: parsed.data.percent,
        startsAt: dates.startsAt ?? undefined,
        endsAt: dates.endsAt ?? undefined,
      },
    })
    revalidatePath('/admin/discounts')
    redirect('/admin/discounts?success=updated')
  } catch (err: unknown) {
    const code = (err as { code?: string } | undefined)?.code || ''
    if (code === 'P2002') redirect('/admin/discounts?error=exists')
    redirect('/admin/discounts?error=unknown')
  }
}

export async function deleteDiscount(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/discounts?error=invalid')
  try {
    await prisma.discountCode.delete({ where: { id } })
    revalidatePath('/admin/discounts')
    redirect('/admin/discounts?success=deleted')
  } catch {
    redirect('/admin/discounts?error=unknown')
  }
}
