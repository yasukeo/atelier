import Link from "next/link";
import Image from 'next/image'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import PaintingCard from './paintings/painting-card'
import { HomePaintingsSkeleton } from './paintings/skeletons'
import { getLatestPaintings } from '@/lib/paintings'
import { cloudinaryBlurUrl, formatDimensions, formatMAD } from '@/lib/format'
import { Khatam } from '@/components/Khatam'

export const metadata: Metadata = {
  title: "Elwarcha | الورشة - Galerie d'art marocain | Peintures & Tableaux",
  description: "Elwarcha الورشة : galerie d'art en ligne. Peintures originales, tableaux marocains faits main, recréations sur mesure. Livraison au Maroc et international. Achetez des œuvres d'art uniques.",
  alternates: { canonical: 'https://www.elwarcha.com' },
  openGraph: {
    title: "Elwarcha | الورشة - Galerie d'art marocain",
    description: "Peintures originales, tableaux marocains faits main, recréations sur mesure. Achetez en ligne.",
    url: 'https://www.elwarcha.com',
  },
}

/* JSON-LD structured data for the homepage */
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Elwarcha | الورشة',
  url: 'https://www.elwarcha.com',
  description: "Galerie d'art marocain en ligne. Peintures originales et recréations sur mesure.",
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.elwarcha.com/paintings?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Elwarcha',
  alternateName: 'الورشة',
  url: 'https://www.elwarcha.com',
  logo: 'https://www.elwarcha.com/logos/Plan%20de%20travail%2011.png',
  sameAs: [
    'https://www.instagram.com/el.warcha/',
    'https://www.facebook.com/profile.php?id=61581883214871',
    'https://www.tiktok.com/@elwarcha.com',
  ],
}

// ISR: cache for 5 min; on revalidation failure Next.js keeps serving stale content
export const revalidate = 300

const STEPS = [
  { title: 'Vous passez commande', text: 'Choisissez une œuvre (et son format pour une re-création), puis indiquez votre adresse de livraison.' },
  { title: "L'atelier confirme", text: 'Nous vérifions la disponibilité et vous contactons. Une avance peut être demandée pour une re-création.' },
  { title: 'Réalisation et emballage', text: 'Les re-créations sont peintes à la main dans le délai indiqué. Chaque tableau part avec coins protégés et carton renforcé.' },
  { title: 'Livraison', text: 'Partout au Maroc. Vous êtes informé par email à chaque étape de la commande.' },
]

/* Featured work beside the hero title: the most recent painting */
async function HeroWork() {
  const [work] = await getLatestPaintings()
  const image = work?.images[0]
  if (!work || !image) return null
  const blur = cloudinaryBlurUrl(image.url)
  return (
    <figure className="group relative">
      <p className="eyebrow text-sable/70 mb-4">Dernière œuvre arrivée</p>
      <div className="relative aspect-[4/5] overflow-hidden bg-nuit-clair shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
        <Image
          src={image.url}
          alt={image.alt || work.title}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 40vw"
          className="object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-[1.02]"
          {...(blur ? { placeholder: 'blur' as const, blurDataURL: blur } : {})}
        />
      </div>
      <figcaption className="mt-4 flex items-baseline justify-between gap-4 text-sm">
        <Link href={`/paintings/${work.id}`} className="font-display text-xl text-chaux after:absolute after:inset-0">
          {work.title}
        </Link>
        <span className="tabular text-sable/70 whitespace-nowrap">
          {formatDimensions(work.widthCm, work.heightCm)} · {formatMAD(work.priceMAD)}
        </span>
      </figcaption>
    </figure>
  )
}

async function FeaturedPaintings() {
  const paintings = await getLatestPaintings()
  if (paintings.length === 0) {
    return <p className="text-pierre">Aucune œuvre en vente pour le moment. Revenez bientôt, ou écrivez-nous pour une commande sur mesure.</p>
  }
  return (
    <div className="grid gap-x-5 gap-y-12 sm:gap-x-8 grid-cols-2 lg:grid-cols-4">
      {paintings.map((p, i) => (
        <PaintingCard key={p.id} painting={p} priority={i < 2} />
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* Hero: the name of the atelier, in Arabic, is the thesis */}
      <section className="bg-nuit text-sable">
        <div className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-12 pb-16 lg:pt-14 lg:pb-20 grid gap-14 lg:grid-cols-12 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-sable/70">Galerie en ligne · Peintures originales</p>
            <h1 className="mt-6">
              <span className="sr-only">Elwarcha — </span>
              <span lang="ar" dir="rtl" className="block font-arabic font-bold text-[clamp(6.5rem,17vw,15rem)] leading-[0.85] text-sable text-left">الورشة</span>
              <span className="block mt-6 font-display text-[clamp(2.25rem,4.6vw,4.25rem)] leading-[1.04] text-chaux max-w-[16ch] text-balance">
                Des tableaux peints à la main, pour vos murs.
              </span>
            </h1>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-sable/75">
              Elwarcha veut dire « l&apos;atelier » en arabe. Pièces uniques et re‑créations sur commande, peintes au Maroc et livrées partout dans le pays.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link href="/paintings" className="btn-clair">Voir les œuvres</Link>
              <Link href="#commande" className="text-sm text-sable/80 underline decoration-sable/30 underline-offset-4 hover:text-white hover:decoration-white transition-colors">
                Comment commander
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:pl-6">
            <Suspense fallback={<div className="aspect-[4/5] bg-nuit-clair animate-pulse" />}>
              <HeroWork />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Available works */}
      <section className="max-w-[88rem] mx-auto w-full px-5 sm:px-8 py-20 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 mb-12">
          <div>
            <p className="eyebrow">La galerie</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl text-encre">Œuvres disponibles</h2>
          </div>
          <Link href="/paintings" className="lien text-sm whitespace-nowrap">Toute la galerie →</Link>
        </div>
        <Suspense fallback={<HomePaintingsSkeleton />}>
          <FeaturedPaintings />
        </Suspense>
      </section>

      {/* The two ways to buy, explained once so the cards can stay short */}
      <section aria-labelledby="deux-facons" className="border-y border-trait bg-papier">
        <div className="max-w-[88rem] mx-auto px-5 sm:px-8 py-20 lg:py-24 grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow">Acheter une œuvre</p>
            <h2 id="deux-facons" className="mt-3 font-display text-4xl text-encre leading-tight">Deux façons de l&apos;accrocher chez vous</h2>
          </div>
          <div className="lg:col-span-8 grid gap-10 sm:grid-cols-2 sm:gap-12">
            <div className="space-y-4">
              <Khatam className="size-9 text-grenat" />
              <h3 className="font-display text-2xl text-encre">Pièce unique</h3>
              <p className="text-[15px] leading-relaxed text-encre/80">
                L&apos;original, peint à la main. Il n&apos;en existe qu&apos;un : une fois vendu, il quitte la galerie. Le sceau de l&apos;atelier le signale sur chaque œuvre.
              </p>
              <Link href="/paintings?kind=UNIQUE" className="lien text-sm inline-block">Voir les pièces uniques</Link>
            </div>
            <div className="space-y-4">
              <span aria-hidden="true" className="block font-display text-4xl leading-9 text-grenat">↻</span>
              <h3 className="font-display text-2xl text-encre">Re-création</h3>
              <p className="text-[15px] leading-relaxed text-encre/80">
                L&apos;atelier repeint l&apos;œuvre à la main d&apos;après l&apos;original, dans le format de votre choix. Le délai de réalisation est indiqué sur chaque œuvre.
              </p>
              <Link href="/paintings?kind=RECREATABLE" className="lien text-sm inline-block">Voir les re-créations</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Order process: a real sequence, hence the numbers */}
      <section id="commande" aria-labelledby="commande-titre" className="max-w-[88rem] mx-auto w-full px-5 sm:px-8 py-20 lg:py-28 scroll-mt-20">
        <p className="eyebrow">Commander</p>
        <h2 id="commande-titre" className="mt-3 font-display text-4xl sm:text-5xl text-encre">Comment se passe une commande</h2>
        <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((s, i) => (
            <li key={s.title} className="border-t border-encre pt-6">
              <span className="font-display text-5xl leading-none text-grenat tabular">{i + 1}</span>
              <h3 className="mt-5 text-[17px] font-semibold text-encre">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-encre/75">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-14 text-sm text-pierre">
          Une question avant de commander ? <Link href="/contact" className="lien">Écrivez à l&apos;atelier</Link>.
        </p>
      </section>
    </>
  )
}
