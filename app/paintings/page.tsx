import { prisma } from '@/lib/db'
import Link from 'next/link'
import PaintingCard from './painting-card'
import { Filters } from './Filters.client'
import { parsePaintingFilters } from '@/lib/painting-filters'
import { Prisma } from '@prisma/client'

export const revalidate = 60 // cache briefly for public view

export default async function PaintingsGalleryPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const filters = parsePaintingFilters(searchParams)
  const where: Prisma.PaintingWhereInput = {}
  if (filters.artist) where.artistId = filters.artist
  if (filters.style) where.styleId = filters.style
  if (filters.technique) where.techniqueId = filters.technique
  if (filters.kind) where.kind = filters.kind
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
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { artist: { name: { contains: q } } },
    ]
  }
  // NOTE: color palette future filter placeholder (filters.colors)
  const [paintings, artists, styles, techniques] = await Promise.all([
    prisma.painting.findMany({
    where,
    include: { artist: true, images: { orderBy: { position: 'asc' } } },
    orderBy: { createdAt: 'desc' },
      take: 60,
    }),
    prisma.artist.findMany({ orderBy: { name: 'asc' }, take: 200, select: { id: true, name: true } }),
    prisma.style.findMany({ orderBy: { name: 'asc' }, take: 200, select: { id: true, name: true } }),
    prisma.technique.findMany({ orderBy: { name: 'asc' }, take: 200, select: { id: true, name: true } }),
  ])
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
      <div className="flex items-baseline justify-between mb-6 sm:mb-8 gap-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#6B2D2D]">Galerie</h1>
        <Link href="/" className="text-sm text-[#8B7355] hover:text-[#6B2D2D] hover:underline">Accueil</Link>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-10 items-start">
        <aside className="lg:sticky top-20 h-max border border-[#D8D5C8] rounded-md p-4 bg-[#F7F5F0]">
          <Filters artists={artists} styles={styles} techniques={techniques} />
        </aside>
        <div>
          {paintings.length === 0 && (
            <p className="text-muted-foreground mb-4">Aucune peinture trouvée avec ces filtres.</p>
          )}
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paintings.map(p => (
              <PaintingCard key={p.id} painting={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
