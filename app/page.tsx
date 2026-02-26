import { prisma } from "@/lib/db";
import Link from "next/link";
import dynamic from 'next/dynamic'
import type { Painting, Artist, PaintingImage } from '@prisma/client'
import { t, tObj } from '@/lib/i18n'
import HeroImagesCarousel from './HeroImagesCarousel.client'

// Lazy import the painting card client component so the homepage server component stays light
const PaintingCard = dynamic(() => import('./paintings/painting-card'))

interface PaintingWithRels extends Painting { artist: Artist; images: PaintingImage[] }

export const revalidate = 300

export default async function Home() {
  // Session no longer needed here since auth actions are only in the global top bar.
  // const session = await getServerSession(authOptions)

  // Parallel data fetching — graceful fallback to empty if DB is unreachable
  let paintings: PaintingWithRels[] = []
  try {
    paintings = await prisma.painting.findMany({
      where: { available: true },
      include: { artist: true, images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }) as PaintingWithRels[]
  } catch (err) {
    console.error('[Home] DB query failed:', err)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E9E7DB] via-[#FDFCFA] to-[#E9E7DB] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-10 sm:pb-14 flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="flex-1 max-w-2xl text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#6B2D2D]">
              {t('home.hero.title')}
            </h1>
            <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-[#8B7355] leading-relaxed">
              {t('home.hero.description')}
            </p>
            <div className="mt-6 sm:mt-8">
              <Link href="/paintings" className="inline-flex items-center justify-center rounded-full border border-[#D8D5C8] px-6 h-11 text-sm font-medium bg-[#6B2D2D] text-white hover:bg-[#5A2525] transition">
                {t('home.hero.ctaGallery')}
              </Link>
              <p className="mt-3 text-xs text-[#8B7355]">{t('home.hero.prompt')}</p>
            </div>
          </div>
          {paintings.length > 0 && (
            <HeroImagesCarousel paintings={paintings as PaintingWithRels[]} />
          )}
        </div>
      </section>

      {/* Featured paintings */}
      <section className="py-10 sm:py-14 border-t border-[#DCD9CC] bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2D2A26]">{t('home.featured.title')}</h2>
            <Link href="/paintings" className="text-sm text-[#8B7355] hover:text-[#6B2D2D] hover:underline">{t('home.featured.all')}</Link>
          </div>
          {paintings.length === 0 ? (
            <p className="text-sm text-[#8B7355]">{t('home.featured.none')}</p>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {paintings.map(p => (
                <PaintingCard key={p.id} painting={p as PaintingWithRels} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Value proposition / process */}
      <section className="py-12 sm:py-20 bg-[#E9E7DB] border-t border-[#D8D5C8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-8 sm:gap-10 md:grid-cols-3">
          {(['quality','customization','trust'] as const).map(key => {
            const base = tObj<{ kicker: string; title: string; text: string }>(`home.process.blocks.${key}`)
            if (!base) return null
            return (
              <div key={key} className="space-y-2 sm:space-y-3 text-center md:text-left">
                <div className="text-[#D97706] text-xs sm:text-sm font-medium tracking-wide uppercase">{base.kicker}</div>
                <h3 className="text-base sm:text-lg font-semibold leading-snug text-[#2D2A26]">{base.title}</h3>
                <p className="text-xs sm:text-sm text-[#8B7355] leading-relaxed">{base.text}</p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
// processBlocks now sourced from i18n dictionary
