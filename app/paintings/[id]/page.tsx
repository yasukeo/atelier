import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPaintingDetail, getRelatedPaintings } from '@/lib/paintings'
import { formatDimensions } from '@/lib/format'
import PaintingCard from '../painting-card'
import { PaintingGallery } from './PaintingGallery.client'
import { PurchasePanel } from './PurchasePanel.client'

const SITE_URL = 'https://www.elwarcha.com'

// ISR: cached 5 min, refreshed on demand when admins edit a painting or an order sells it
export const revalidate = 300

// No paths prebuilt (no DB access at build time): each page is rendered on its first visit, then cached
export async function generateStaticParams() {
  return []
}

const orientationLabels: Record<string, string> = {
  PORTRAIT: 'Portrait',
  PAYSAGE: 'Paysage',
  CARRE: 'Carré',
  AUTRE: 'Autre',
}

function absoluteUrl(url: string) {
  return url.startsWith('http') ? url : `${SITE_URL}${encodeURI(url)}`
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const painting = await getPaintingDetail(id).catch(() => null)
  if (!painting) return { title: 'Œuvre introuvable', robots: { index: false } }

  const description = (painting.description?.trim() ||
    `${painting.kind === 'UNIQUE' ? 'Pièce unique' : 'Œuvre recréable'} de ${painting.artist.name}, ${formatDimensions(painting.widthCm, painting.heightCm)}. Peinture faite main, livrée au Maroc.`
  ).slice(0, 160)
  const image = painting.images[0]
  const url = `${SITE_URL}/paintings/${painting.id}`
  return {
    title: `${painting.title} — ${painting.artist.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${painting.title} | Elwarcha`,
      description,
      url,
      images: image ? [{ url: absoluteUrl(image.url), alt: image.alt || painting.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${painting.title} | Elwarcha`,
      description,
      images: image ? [absoluteUrl(image.url)] : undefined,
    },
  }
}

export default async function PaintingPage({ params }: PageProps) {
  const { id } = await params
  const painting = await getPaintingDetail(id)
  if (!painting) notFound()

  const related = await getRelatedPaintings(painting).catch(() => [])
  const isUnique = painting.kind === 'UNIQUE'
  const url = `${SITE_URL}/paintings/${painting.id}`
  const prices = [painting.priceMAD, ...painting.recreationOptions.map(o => o.priceMAD)]

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: painting.title,
    description: painting.description || undefined,
    image: painting.images.map(i => absoluteUrl(i.url)),
    url,
    brand: { '@type': 'Brand', name: 'Elwarcha' },
    category: 'Peinture',
    width: { '@type': 'QuantitativeValue', value: painting.widthCm, unitCode: 'CMT' },
    height: { '@type': 'QuantitativeValue', value: painting.heightCm, unitCode: 'CMT' },
    offers: prices.length > 1
      ? {
          '@type': 'AggregateOffer',
          priceCurrency: 'MAD',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: prices.length,
          availability: painting.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        }
      : {
          '@type': 'Offer',
          priceCurrency: 'MAD',
          price: painting.priceMAD,
          url,
          availability: painting.available ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          itemCondition: 'https://schema.org/NewCondition',
        },
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Galerie', item: `${SITE_URL}/paintings` },
      { '@type': 'ListItem', position: 3, name: painting.title, item: url },
    ],
  }
  // Escape "<" so user-provided text can never close the <script> tag
  const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c')

  const details: { label: string; value: string }[] = [
    { label: 'Artiste', value: painting.artist.name },
    { label: 'Dimensions', value: formatDimensions(painting.widthCm, painting.heightCm) },
    { label: 'Orientation', value: orientationLabels[painting.orientation] ?? painting.orientation },
    ...(painting.style ? [{ label: 'Style', value: capitalize(painting.style.name) }] : []),
    ...(painting.technique ? [{ label: 'Technique', value: capitalize(painting.technique.name) }] : []),
    { label: 'Type', value: isUnique ? 'Pièce unique' : 'Re-création possible' },
    ...(painting.leadTimeWeeks ? [{ label: 'Délai de réalisation', value: painting.leadTimeWeeks }] : []),
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }} />

      <nav aria-label="Fil d'Ariane" className="text-xs text-[#8B7355] mb-5 sm:mb-8">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-[#6B2D2D] hover:underline">Accueil</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/paintings" className="hover:text-[#6B2D2D] hover:underline">Galerie</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-[#2D2A26] truncate max-w-[50vw]" aria-current="page">{painting.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:gap-14 lg:grid-cols-2 items-start">
        <PaintingGallery images={painting.images} title={painting.title} />

        <div className="space-y-6 lg:sticky lg:top-20">
          <header className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[#D97706]">
              {isUnique ? 'Pièce unique' : 'Œuvre recréable'}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#6B2D2D]">{painting.title}</h1>
            <p className="text-sm text-[#8B7355]">
              par <Link href={`/paintings?artist=${painting.artistId}`} className="text-[#2D2A26] hover:text-[#6B2D2D] underline-offset-2 hover:underline">{painting.artist.name}</Link>
              {' · '}{formatDimensions(painting.widthCm, painting.heightCm)}
            </p>
          </header>

          <PurchasePanel
            paintingId={painting.id}
            title={painting.title}
            kind={painting.kind}
            available={painting.available}
            priceMAD={painting.priceMAD}
            widthCm={painting.widthCm}
            heightCm={painting.heightCm}
            leadTimeWeeks={painting.leadTimeWeeks}
            options={painting.recreationOptions.map(o => ({ id: o.id, widthCm: o.widthCm, heightCm: o.heightCm, priceMAD: o.priceMAD }))}
          />

          {painting.description && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-[#2D2A26]">À propos de l&apos;œuvre</h2>
              <p className="text-sm leading-relaxed text-[#5C5145] whitespace-pre-line">{painting.description}</p>
            </section>
          )}

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-[#2D2A26]">Caractéristiques</h2>
            <dl className="divide-y divide-[#E9E7DB] rounded-lg border border-[#E9E7DB] bg-[#FDFCFA] text-sm">
              {details.map(d => (
                <div key={d.label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-[#8B7355]">{d.label}</dt>
                  <dd className="text-[#2D2A26] text-right">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {painting.artist.bio && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-[#2D2A26]">L&apos;artiste</h2>
              <p className="text-sm leading-relaxed text-[#5C5145]">{painting.artist.bio}</p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14 sm:mt-20 pt-10 border-t border-[#DCD9CC]">
          <div className="flex items-center justify-between mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#2D2A26]">Vous aimerez aussi</h2>
            <Link href="/paintings" className="text-sm text-[#8B7355] hover:text-[#6B2D2D] hover:underline">Toute la galerie →</Link>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {related.map(p => <PaintingCard key={p.id} painting={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
