import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPaintingDetail, getRelatedPaintings } from '@/lib/paintings'
import { formatDimensions } from '@/lib/format'
import PaintingCard from '../painting-card'
import { Khatam } from '@/components/Khatam'
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

  const leadTime = painting.leadTimeWeeks?.trim()
  const details: { label: string; value: string }[] = [
    ...(painting.technique ? [{ label: 'Technique', value: capitalize(painting.technique.name) }] : []),
    ...(painting.style ? [{ label: 'Style', value: capitalize(painting.style.name) }] : []),
    { label: 'Dimensions', value: formatDimensions(painting.widthCm, painting.heightCm) },
    { label: 'Orientation', value: orientationLabels[painting.orientation] ?? painting.orientation },
    { label: 'Type', value: isUnique ? 'Pièce unique' : 'Re-création sur commande' },
    ...(leadTime ? [{ label: 'Délai de réalisation', value: /^\d+$/.test(leadTime) ? `${leadTime} semaines` : leadTime }] : []),
  ]

  return (
    <div className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-8 sm:pt-10 pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }} />

      <nav aria-label="Fil d'Ariane" className="text-[13px] text-pierre mb-8">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-encre">Accueil</Link></li>
          <li aria-hidden="true" className="text-trait">/</li>
          <li><Link href="/paintings" className="hover:text-encre">Galerie</Link></li>
          <li aria-hidden="true" className="text-trait">/</li>
          <li className="text-encre truncate max-w-[50vw]" aria-current="page">{painting.title}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start">
        <div className="lg:sticky lg:top-24">
          <PaintingGallery images={painting.images} title={painting.title} />
        </div>

        <div className="space-y-10">
          <header className="space-y-4">
            <p className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-grenat">
              {isUnique ? <><Khatam className="size-4" /> Pièce unique</> : <><span aria-hidden="true">↻</span> Re-création sur commande</>}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl xl:text-6xl leading-[1.02] text-encre text-balance">{painting.title}</h1>
            <p className="text-[15px] text-pierre">
              par <Link href={`/paintings?artist=${painting.artistId}`} className="text-encre underline decoration-trait underline-offset-4 hover:decoration-encre">{painting.artist.name}</Link>
              {painting.technique && <> · <span className="capitalize">{painting.technique.name}</span></>}
              {' · '}<span className="tabular">{formatDimensions(painting.widthCm, painting.heightCm)}</span>
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
            <section className="space-y-3">
              <h2 className="eyebrow">À propos de l&apos;œuvre</h2>
              <p className="text-[16px] leading-relaxed text-encre/85 whitespace-pre-line">{painting.description}</p>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="eyebrow">Caractéristiques</h2>
            <dl className="divide-y divide-trait border-y border-trait text-[15px]">
              {details.map(d => (
                <div key={d.label} className="flex justify-between gap-6 py-3">
                  <dt className="text-pierre">{d.label}</dt>
                  <dd className="text-encre text-right tabular">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {painting.artist.bio && (
            <section className="space-y-3">
              <h2 className="eyebrow">L&apos;artiste</h2>
              <p className="font-display text-2xl text-encre">{painting.artist.name}</p>
              <p className="text-[15px] leading-relaxed text-encre/80">{painting.artist.bio}</p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 sm:mt-32 pt-12 border-t border-trait">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 mb-12">
            <h2 className="font-display text-3xl sm:text-4xl text-encre">Vous aimerez aussi</h2>
            <Link href="/paintings" className="lien text-sm whitespace-nowrap">Toute la galerie →</Link>
          </div>
          <div className="grid gap-x-5 gap-y-12 sm:gap-x-8 grid-cols-2 lg:grid-cols-4">
            {related.map(p => <PaintingCard key={p.id} painting={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
