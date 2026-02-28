import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { storeImage } from '@/lib/media'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

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

async function requireAdminSession() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string } | undefined)?.role
  if (role !== 'ADMIN') throw new Error('Unauthorized')
  return session
}

function normalizeOptionalId(v: FormDataEntryValue | null): string | undefined {
  const s = (v == null ? '' : String(v)).trim()
  return s.length ? s : undefined
}

function extractPaintingData(formData: FormData) {
  return {
    title: String(formData.get('title') || '').trim(),
    description: String(formData.get('description') || '').trim() || undefined,
    kind: String(formData.get('kind') || ''),
    priceMAD: formData.get('priceMAD'),
    widthCm: formData.get('widthCm'),
    heightCm: formData.get('heightCm'),
    orientation: String(formData.get('orientation') || ''),
    available: formData.get('available') != null,
    leadTimeWeeks: String(formData.get('leadTimeWeeks') || '').trim() || undefined,
    artistId: String(formData.get('artistId') || ''),
    styleId: normalizeOptionalId(formData.get('styleId')),
    techniqueId: normalizeOptionalId(formData.get('techniqueId')),
  }
}

const MAX_FILE_BYTES = 5 * 1024 * 1024
const MAX_TOTAL_BYTES = 15.5 * 1024 * 1024

/**
 * Save painting images from either:
 * - `imageUrls` (pre-uploaded Cloudinary URLs from client-side upload)
 * - `images` (file uploads, fallback for local dev)
 */
async function saveImages(formData: FormData, paintingId: string, title: string, startPosition: number) {
  let position = startPosition

  // Prefer pre-uploaded Cloudinary URLs (client-side upload)
  const urls = formData.getAll('imageUrls').map(v => String(v).trim()).filter(Boolean)
  if (urls.length > 0) {
    for (const url of urls) {
      await prisma.paintingImage.create({ data: { paintingId, url, alt: title, position } })
      position++
    }
    return { error: null }
  }

  // Fallback: handle file uploads server-side (works locally, may fail on Vercel for large files)
  const files = formData.getAll('images') as File[]
  let totalBytes = 0
  for (const file of files) {
    if (file && file.size > 0) {
      if (file.size > MAX_FILE_BYTES) {
        return { error: 'file-too-large' }
      }
      totalBytes += file.size
      if (totalBytes > MAX_TOTAL_BYTES) {
        return { error: 'payload-too-large' }
      }
      const arrayBuffer = await file.arrayBuffer()
      const { url } = await storeImage(Buffer.from(arrayBuffer), file.name)
      await prisma.paintingImage.create({ data: { paintingId, url, alt: title, position } })
      position++
    }
  }
  return { error: null }
}

/** POST: create painting */
export async function POST(req: NextRequest) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const formData = await req.formData()
    const dataRaw = extractPaintingData(formData)
    const parsed = paintingSchema.safeParse(dataRaw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    const created = await prisma.painting.create({ data: parsed.data })
    const uploadResult = await saveImages(formData, created.id, parsed.data.title, 0)
    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
    }
    revalidatePath('/admin/paintings')
    return NextResponse.json({ success: 'created' })
  } catch (e) {
    console.error('createPainting API error:', e)
    return NextResponse.json({ error: 'unknown' }, { status: 500 })
  }
}

/** PUT: update painting */
export async function PUT(req: NextRequest) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  try {
    const formData = await req.formData()
    const id = String(formData.get('id') || '')
    const dataRaw = extractPaintingData(formData)
    const parsed = paintingSchema.safeParse(dataRaw)
    if (!parsed.success || !id) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    const updated = await prisma.painting.update({ where: { id }, data: parsed.data })
    const existingCount = await prisma.paintingImage.count({ where: { paintingId: updated.id } })
    const uploadResult = await saveImages(formData, updated.id, parsed.data.title, existingCount)
    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error }, { status: 400 })
    }
    revalidatePath('/admin/paintings')
    return NextResponse.json({ success: 'updated' })
  } catch (e) {
    console.error('updatePainting API error:', e)
    return NextResponse.json({ error: 'unknown' }, { status: 500 })
  }
}
