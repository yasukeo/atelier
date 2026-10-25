import { prisma } from '@/lib/db'
import Link from 'next/link'
import PaintingCard from '../painting-card'
import { Filters } from '../Filters.client'
import { parsePaintingFilters } from '@/lib/painting-filters'
import { paintingCardInclude } from '@/lib/paintings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Galerie de peintures',
  description: "Explorez notre galerie de peintures : tableaux originaux, art marocain contemporain, pièces uniques et recréations sur mesure. Filtrez par artiste, style, technique et prix.",
  alternates: { canonical: 'https://www.elwarcha.com/paintings' },
  openGraph: {
    title: 'Galerie | Elwarcha',
    description: "Tableaux originaux, art marocain contemporain, pièces uniques et recréations.",
    url: 'https://www.elwarcha.com/paintings',
  },
}
import { Prisma } from '@prisma/client'
import { Suspense } from 'react'
import { PaintingGridSkeleton } from '../skeletons'

// ISR: cache for 1 min; on revalidation failure Next.js keeps serving stale content
export const revalidate = 60

/* ─── Inner async component: streams in after data fetches ─── */
async function PaintingResults({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const filters = parsePaintingFilters(searchParams)
  const where: Prisma.PaintingWhereInput = {
    available: true,
  }
  if (filters.artist) where.artistId = filters.artist
  if (filters.style) where.styleId = filters.style
  if (filters.technique) where.techniqueId = filters.technique
  if (filters.kind) where.kind = filters.kind
  if (filters.orientation) where.orientation = filters.orientation
  if (filters.minPrice || filters.maxPrice) {
    where.priceMAD = {}
    if (filters.minPrice) where.priceMAD.gte = filters.minPrice
    if (filters.maxPrice) where.priceMAD.lte = filters.maxPrice
  }
  if (filters.minWidth || filters.maxWidth) {
    where.widthCm = {}
    if (filters.minWidth) where.widthCm.gte = filters.minWidth
    if (filters.maxWidth) where.widthCm.lte = filters.maxWidth
  }
  if (filters.minHeight || filters.maxHeight) {
    where.heightCm = {}
    if (filters.minHeight) where.heightCm.gte = filters.minHeight
    if (filters.maxHeight) where.heightCm.lte = filters.maxHeight
  }
  if (filters.q) {
    const q = filters.q
    // Postgres `contains` is case-sensitive by default
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { artist: { name: { contains: q, mode: 'insensitive' } } },
    ]
  }
  const orderBy: Prisma.PaintingOrderByWithRelationInput[] =
    filters.sort === 'price-asc' ? [{ priceMAD: 'asc' }, { createdAt: 'desc' }]
    : filters.sort === 'price-desc' ? [{ priceMAD: 'desc' }, { createdAt: 'desc' }]
    : [{ createdAt: 'desc' }]
  const paintings = await prisma.painting.findMany({
    where,
    include: paintingCardInclude,
    orderBy,
    take: 60,
  })
  if (paintings.length === 0) {
    return (
      <div className="border border-dashed border-trait px-6 py-16 text-center">
        <p className="font-display text-2xl text-encre">Aucune œuvre ne correspond à ces filtres.</p>
        <p className="mt-3 text-sm text-pierre">Élargissez la fourchette de prix ou de dimensions, ou retirez un filtre.</p>
        <Link href="/paintings" className="btn-secondaire mt-8">Voir toutes les œuvres</Link>
      </div>
    )
  }
  return (
    <>
      <h2 className="sr-only">Résultats</h2>
      <p className="eyebrow mb-8" aria-live="polite">
        {paintings.length >= 60 ? '60+ œuvres' : `${paintings.length} œuvre${paintings.length > 1 ? 's' : ''}`}
      </p>
      <div className="grid gap-x-5 gap-y-14 sm:gap-x-8 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {paintings.map((p, i) => (
          <PaintingCard key={p.id} painting={p} priority={i < 4} />
        ))}
      </div>
    </>
  )
}

/* ─── Filter sidebar data loader ─── */
async function FilterSidebar() {
  const [artists, styles, techniques] = await Promise.all([
    prisma.artist.findMany({ orderBy: { name: 'asc' }, take: 200, select: { id: true, name: true } }),
    prisma.style.findMany({ orderBy: { name: 'asc' }, take: 200, select: { id: true, name: true } }),
    prisma.technique.findMany({ orderBy: { name: 'asc' }, take: 200, select: { id: true, name: true } }),
  ])
  return <Filters artists={artists} styles={styles} techniques={techniques} />
}

export default async function PaintingsGalleryPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const resolvedParams = await searchParams
  return (
    <div className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 pb-10">
        <h1 className="font-display text-6xl sm:text-7xl leading-none text-encre">Galerie</h1>
        <p className="text-[15px] leading-relaxed text-pierre max-w-md">
          Peintures originales et re&#8209;créations, peintes à la main. Chaque fiche indique le format, le prix et le délai de réalisation.
        </p>
      </header>
      <Suspense fallback={<div className="h-[73px] border-y border-trait" />}>
        <FilterSidebar />
      </Suspense>
      <div className="pt-10">
        <Suspense fallback={<PaintingGridSkeleton count={8} />}>
          <PaintingResults searchParams={resolvedParams} />
        </Suspense>
      </div>
    </div>
  )
}
