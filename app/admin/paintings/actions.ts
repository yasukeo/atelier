"use server"
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { storeImage } from '@/lib/media'

const enums = {
  kinds: ['UNIQUE', 'RECREATABLE'] as const,
  orientations: ['PORTRAIT', 'PAYSAGE', 'CARRE', 'AUTRE'] as const,
}

const paintingSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  kind: z.enum(enums.kinds),
  priceMAD: z.coerce.number().int().min(0),
  widthCm: z.coerce.number().int().min(1),
  heightCm: z.coerce.number().int().min(1),
  orientation: z.enum(enums.orientations),
  available: z.boolean().optional(),
  leadTimeWeeks: z.string().max(50).optional(),
  artistId: z.string().min(1),
  styleId: z.string().optional(),
  techniqueId: z.string().optional(),
})

function normalizeOptionalId(v: FormDataEntryValue | null): string | undefined {
  const s = (v == null ? '' : String(v)).trim()
  return s.length ? s : undefined
}

export async function createPainting(formData: FormData) {
  await requireAdmin()
  const dataRaw = {
    title: String(formData.get('title') || '').trim(),
    description: (String(formData.get('description') || '').trim() || undefined),
    kind: String(formData.get('kind') || ''),
    priceMAD: formData.get('priceMAD'),
    widthCm: formData.get('widthCm'),
    heightCm: formData.get('heightCm'),
    orientation: String(formData.get('orientation') || ''),
    available: formData.get('available') != null,
    leadTimeWeeks: (String(formData.get('leadTimeWeeks') || '').trim() || undefined),
    artistId: String(formData.get('artistId') || ''),
    styleId: normalizeOptionalId(formData.get('styleId')),
    techniqueId: normalizeOptionalId(formData.get('techniqueId')),
  }
  const parsed = paintingSchema.safeParse(dataRaw)
  if (!parsed.success) {
    redirect('/admin/paintings?error=invalid')
  }
  try {
    const created = await prisma.painting.create({ data: parsed.data })
    // Support multiple images (input name="images") with size validation
    const files = formData.getAll('images') as File[]
    const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5MB per image
    const MAX_TOTAL_BYTES = 15.5 * 1024 * 1024 // keep a safety margin under 16mb body cap
    let totalBytes = 0
    let position = 0
    for (const file of files) {
      if (file && file.size > 0) {
        if (file.size > MAX_FILE_BYTES) {
          redirect('/admin/paintings?error=file-too-large')
        }
        totalBytes += file.size
        if (totalBytes > MAX_TOTAL_BYTES) {
          redirect('/admin/paintings?error=payload-too-large')
        }
        const arrayBuffer = await file.arrayBuffer()
        const { url } = await storeImage(Buffer.from(arrayBuffer), file.name)
        await prisma.paintingImage.create({ data: { paintingId: created.id, url, alt: parsed.data.title, position } })
        position++
      }
    }
    revalidatePath('/admin/paintings')
  } catch (e) {
    console.error('createPainting error:', e)
    redirect('/admin/paintings?error=unknown')
  }
  redirect('/admin/paintings?success=created')
}

export async function updatePainting(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get('id') || '')
  const dataRaw = {
    title: String(formData.get('title') || '').trim(),
    description: (String(formData.get('description') || '').trim() || undefined),
    kind: String(formData.get('kind') || ''),
    priceMAD: formData.get('priceMAD'),
    widthCm: formData.get('widthCm'),
    heightCm: formData.get('heightCm'),
    orientation: String(formData.get('orientation') || ''),
    available: formData.get('available') != null,
    leadTimeWeeks: (String(formData.get('leadTimeWeeks') || '').trim() || undefined),
    artistId: String(formData.get('artistId') || ''),
    styleId: normalizeOptionalId(formData.get('styleId')),
    techniqueId: normalizeOptionalId(formData.get('techniqueId')),
  }
  const parsed = paintingSchema.safeParse(dataRaw)
  if (!parsed.success || !id) {
    redirect('/admin/paintings?error=invalid')
  }
  try {
    const updated = await prisma.painting.update({ where: { id }, data: parsed.data })
    const newFiles = formData.getAll('images') as File[]
    if (newFiles.length) {
      const existingCount = await prisma.paintingImage.count({ where: { paintingId: updated.id } })
      let position = existingCount
      const MAX_FILE_BYTES = 5 * 1024 * 1024
      const MAX_TOTAL_BYTES = 15.5 * 1024 * 1024
      let totalBytes = 0
      for (const file of newFiles) {
        if (file && file.size > 0) {
          if (file.size > MAX_FILE_BYTES) {
            redirect('/admin/paintings?error=file-too-large')
          }
          totalBytes += file.size
          if (totalBytes > MAX_TOTAL_BYTES) {
            redirect('/admin/paintings?error=payload-too-large')
          }
          const arrayBuffer = await file.arrayBuffer()
          const { url } = await storeImage(Buffer.from(arrayBuffer), file.name)
          await prisma.paintingImage.create({ data: { paintingId: updated.id, url, alt: parsed.data.title, position } })
          position++
        }
      }
    }
    revalidatePath('/admin/paintings')
  } catch (e) {
    console.error('updatePainting error:', e)
    redirect('/admin/paintings?error=unknown')
  }
  redirect('/admin/paintings?success=updated')
}

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
    // Delete related images
    await prisma.paintingImage.deleteMany({ where: { paintingId: id } })
    // Now delete the painting
    await prisma.painting.delete({ where: { id } })
    revalidatePath('/admin/paintings')
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
    revalidatePath('/admin/paintings')
    redirect('/admin/paintings?success=image-removed')
  } catch {
    redirect('/admin/paintings?error=unknown')
  }
}
