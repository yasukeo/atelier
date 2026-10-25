import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'

// Relations needed to render a <PaintingCard>
export const paintingCardInclude = {
  artist: true,
  technique: { select: { name: true } },
  images: { orderBy: { position: 'asc' } },
  recreationOptions: { select: { priceMAD: true } },
} satisfies Prisma.PaintingInclude

export type PaintingCardData = Prisma.PaintingGetPayload<{ include: typeof paintingCardInclude }>

// Deduplicated per request (the homepage hero and featured grid share it)
export const getLatestPaintings = cache(async (take = 8): Promise<PaintingCardData[]> => {
  return prisma.painting.findMany({
    where: { available: true },
    include: paintingCardInclude,
    orderBy: { createdAt: 'desc' },
    take,
  })
})

// Shared by generateMetadata and the page itself
export const getPaintingDetail = cache(async (id: string) => {
  return prisma.painting.findUnique({
    where: { id },
    include: {
      artist: true,
      style: true,
      technique: true,
      images: { orderBy: { position: 'asc' } },
      recreationOptions: { orderBy: [{ widthCm: 'asc' }, { heightCm: 'asc' }] },
    },
  })
})

export type PaintingDetail = NonNullable<Awaited<ReturnType<typeof getPaintingDetail>>>

export async function getRelatedPaintings(p: Pick<PaintingDetail, 'id' | 'artistId' | 'styleId'>, take = 4): Promise<PaintingCardData[]> {
  const related = await prisma.painting.findMany({
    where: {
      available: true,
      id: { not: p.id },
      OR: [{ artistId: p.artistId }, ...(p.styleId ? [{ styleId: p.styleId }] : [])],
    },
    include: paintingCardInclude,
    orderBy: { createdAt: 'desc' },
    take,
  })
  if (related.length >= take) return related
  // Top up with recent works so the section is never half-empty
  const filler = await prisma.painting.findMany({
    where: { available: true, id: { notIn: [p.id, ...related.map(r => r.id)] } },
    include: paintingCardInclude,
    orderBy: { createdAt: 'desc' },
    take: take - related.length,
  })
  return [...related, ...filler]
}

// Public pages are ISR-cached: refresh them whenever a painting changes
export function revalidatePaintingPages(paintingId?: string) {
  revalidatePath('/')
  revalidatePath('/paintings')
  if (paintingId) revalidatePath(`/paintings/${paintingId}`)
  revalidatePath('/admin/paintings')
}
