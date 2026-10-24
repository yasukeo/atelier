"use server"
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePaintingPages } from '@/lib/paintings'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

export async function deletePainting(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/paintings?error=invalid')
  
  // Check if painting has been ordered (we can't delete those to preserve order history)
  const orderItemCount = await prisma.orderItem.count({ where: { paintingId: id } })
  if (orderItemCount > 0) {
    redirect('/admin/paintings?error=has-orders')
  }
  
  try {
    // Delete related cart items first
    await prisma.cartItem.deleteMany({ where: { paintingId: id } })
    // Delete related images and recreation formats (no cascade on these relations)
    await prisma.paintingImage.deleteMany({ where: { paintingId: id } })
    await prisma.paintingRecreationOption.deleteMany({ where: { paintingId: id } })
    // Now delete the painting
    await prisma.painting.delete({ where: { id } })
    revalidatePaintingPages(id)
  } catch (e) {
    console.error('deletePainting error:', e)
    redirect('/admin/paintings?error=linked')
  }
  redirect('/admin/paintings?success=deleted')
}

export async function deletePaintingImage(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/paintings?error=invalid')
  try {
    const img = await prisma.paintingImage.delete({ where: { id } })
    // Re-pack positions for remaining images
    const remaining = await prisma.paintingImage.findMany({ where: { paintingId: img.paintingId }, orderBy: { position: 'asc' } })
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].position !== i) {
        await prisma.paintingImage.update({ where: { id: remaining[i].id }, data: { position: i } })
      }
    }
    revalidatePaintingPages(img.paintingId)
  } catch {
    redirect('/admin/paintings?error=unknown')
  }
  // Outside try/catch: redirect() works by throwing, which the catch above would swallow
  redirect('/admin/paintings?success=image-removed')
}

const recreationOptionSchema = z.object({
  paintingId: z.string().min(1),
  widthCm: z.coerce.number().int().min(1).max(1000),
  heightCm: z.coerce.number().int().min(1).max(1000),
  priceMAD: z.coerce.number().int().min(0).max(10_000_000),
})

export async function addRecreationOption(formData: FormData) {
  await requireAdmin()
  const parsed = recreationOptionSchema.safeParse({
    paintingId: formData.get('paintingId'),
    widthCm: formData.get('widthCm'),
    heightCm: formData.get('heightCm'),
    priceMAD: formData.get('priceMAD'),
  })
  if (!parsed.success) redirect('/admin/paintings?error=invalid')
  const { paintingId, widthCm, heightCm, priceMAD } = parsed.data
  try {
    // Same size twice just updates the price
    await prisma.paintingRecreationOption.upsert({
      where: { paintingId_widthCm_heightCm: { paintingId, widthCm, heightCm } },
      update: { priceMAD },
      create: { paintingId, widthCm, heightCm, priceMAD },
    })
    revalidatePaintingPages(paintingId)
  } catch (e) {
    console.error('addRecreationOption error:', e)
    redirect('/admin/paintings?error=unknown')
  }
  redirect('/admin/paintings?success=option-saved')
}

export async function deleteRecreationOption(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  if (!id) redirect('/admin/paintings?error=invalid')
  try {
    const opt = await prisma.paintingRecreationOption.delete({ where: { id } })
    revalidatePaintingPages(opt.paintingId)
  } catch (e) {
    console.error('deleteRecreationOption error:', e)
    redirect('/admin/paintings?error=unknown')
  }
  redirect('/admin/paintings?success=option-removed')
}
