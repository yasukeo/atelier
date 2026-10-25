import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'À propos',
  description: "Découvrez Elwarcha الورشة : notre mission, nos valeurs, notre équipe et notre approche artistique. Atelier d'art marocain.",
  alternates: { canonical: 'https://www.elwarcha.com/about' },
  openGraph: {
    title: 'À propos | Elwarcha',
    description: "Notre mission, nos valeurs et notre approche artistique.",
    url: 'https://www.elwarcha.com/about',
  },
}

const VALUES = [
  { title: 'Authenticité', desc: 'Chaque œuvre est sélectionnée ou recréée avec un souci d’authenticité et de respect artistique.' },
  { title: 'Accessibilité', desc: 'Rendre l’art original ou sa recréation accessible à un plus grand public.' },
  { title: 'Durabilité', desc: 'Matériaux responsables et processus réfléchis pour réduire l’empreinte.' },
  { title: 'Relation humaine', desc: 'Accompagnement personnalisé avant et après achat.' },
]

const CHECKS = [
  'Contrôle couleur & texture',
  'Emballage soigné et neutre',
  'Support client réactif',
  'Historique de statut de commande transparent',
]

export default function AboutPage() {
  return (
    <div className="pb-24">
      <section className="bg-nuit text-sable">
        <div className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24 grid gap-10 lg:grid-cols-12 items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow text-sable/70">L&apos;atelier</p>
            <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] text-chaux text-balance">
              Entre galerie en ligne et atelier sur mesure.
            </h1>
          </div>
          <p className="lg:col-span-5 text-[16px] leading-relaxed text-sable/80 max-w-md">
            Nous aidons les amateurs d&apos;art à découvrir, acquérir ou commander des œuvres uniques ou recréées avec soin. Notre plateforme relie créativité, transparence et accompagnement.
          </p>
        </div>
      </section>

      <section className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-20 lg:pt-28 grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
        <div className="lg:col-span-5 space-y-5">
          <p className="eyebrow">Notre mission</p>
          <h2 className="font-display text-4xl leading-tight text-encre">Un pont entre l&apos;œuvre originale et sa réinterprétation fidèle</h2>
          <p className="text-[16px] leading-relaxed text-encre/80">Valoriser les artistes tout en simplifiant l&apos;expérience d&apos;achat. Nous croyons qu&apos;une pièce artistique doit raconter une histoire et trouver un lieu qui lui correspond.</p>
          <p className="text-[16px] leading-relaxed text-encre/80">Grâce à un catalogue de pièces uniques et de re&#8209;créations dans plusieurs formats, nous adaptons l&apos;art à l&apos;espace, sans sacrifier la qualité esthétique.</p>
        </div>
        <div className="lg:col-span-7 relative aspect-[4/3] overflow-hidden bg-voile">
          <Image
            src="/about/mission.png"
            alt="Une œuvre originale et sa re-création, reliées par un fil"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </section>

      <section aria-labelledby="valeurs" className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-20 lg:pt-28">
        <h2 id="valeurs" className="font-display text-4xl text-encre">Valeurs</h2>
        <dl className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(v => (
            <div key={v.title} className="border-t border-encre pt-5 pb-8">
              <dt className="text-[17px] font-semibold text-encre">{v.title}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-encre/75">{v.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-16 lg:pt-24 grid gap-12 lg:grid-cols-12 lg:gap-16 items-center">
        <div className="lg:col-span-5 lg:order-2 space-y-5">
          <p className="eyebrow">Processus & qualité</p>
          <h2 className="font-display text-4xl leading-tight text-encre">Chaque commande est vérifiée à la main</h2>
          <p className="text-[16px] leading-relaxed text-encre/80">Validation de la disponibilité, estimation du délai de réalisation pour une re&#8209;création, contrôle visuel avant préparation. Pour certains projets, nous documentons l&apos;évolution de la re&#8209;création.</p>
          <ul className="space-y-2 text-[15px] text-encre/85">
            {CHECKS.map(c => <li key={c} className="flex gap-3"><span aria-hidden="true" className="text-grenat">—</span>{c}</li>)}
          </ul>
        </div>
        <div className="lg:col-span-7 lg:order-1 relative aspect-[4/3] overflow-hidden bg-voile">
          <Image
            src="/about/process.png"
            alt="Plan de travail d'atelier : pinceaux, pigments et toile en cours"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </div>
      </section>

      <section className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-20 lg:pt-28">
        <div className="border-t-2 border-encre pt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl text-encre">Un projet sur mesure ?</h2>
            <p className="mt-3 text-[15px] text-encre/75">Une question, une commande personnalisée ou un partenariat : écrivez-nous.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primaire">Écrire à l&apos;atelier</Link>
            <Link href="/paintings" className="btn-secondaire">Voir les œuvres</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
