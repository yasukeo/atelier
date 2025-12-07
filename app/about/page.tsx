import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'À propos | Elwarcha',
  description: "Découvrez Elwarcha: mission, valeurs, équipe et approche artistique.",
}

const VALUES = [
  { title: 'Authenticité', desc: 'Chaque œuvre est sélectionnée ou recréée avec un souci d’authenticité et de respect artistique.' },
  { title: 'Accessibilité', desc: 'Rendre l’art original ou sa recréation accessible à un plus grand public.' },
  { title: 'Durabilité', desc: 'Matériaux responsables et processus réfléchis pour réduire l’empreinte.' },
  { title: 'Relation humaine', desc: 'Accompagnement personnalisé avant et après achat.' },
]

export default function AboutPage() {
  return (
    <div className="px-6 py-14 max-w-5xl mx-auto space-y-16">
      <section className="space-y-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-[#6B2D2D]">À propos d'Elwarcha</h1>
        <p className="text-[#8B7355] max-w-2xl mx-auto leading-relaxed">Nous aidons les amateurs d'art à découvrir, acquérir ou commander des œuvres uniques ou recréées avec soin. Entre galerie en ligne et atelier sur mesure, notre plateforme relie créativité, transparence et accompagnement.</p>
      </section>

      <section className="grid md:grid-cols-2 gap-10 items-start">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#6B2D2D]">Notre mission</h2>
          <p className="text-sm leading-relaxed text-[#8B7355]">Offrir un pont entre l'œuvre originale et sa réinterprétation fidèle, tout en valorisant les artistes et en simplifiant l'expérience d'achat. Nous croyons qu'une pièce artistique doit raconter une histoire et trouver un lieu qui lui correspond.</p>
          <p className="text-sm leading-relaxed text-[#8B7355]">Grâce à un catalogue de pièces uniques et d'options de recréation dimensionnables, nous adaptons l'art à l'espace, sans sacrifier la qualité esthétique.</p>
        </div>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#D8D5C8] bg-[#E9E7DB]">
          {/* Remplace /about/mission.jpg par le nom réel que tu as copié dans /public/about */}
          <Image
            src="/about/mission.png"
            alt="Pont visuel entre œuvre originale et recréation – notre mission"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[#6B2D2D]">Valeurs</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {VALUES.map(v => (
            <div key={v.title} className="p-5 rounded-lg border border-[#D8D5C8] bg-[#F7F5F0] space-y-2">
              <h3 className="font-medium tracking-tight text-[#2D2A26]">{v.title}</h3>
              <p className="text-xs leading-relaxed text-[#8B7355]">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold text-[#6B2D2D]">Processus & Qualité</h2>
          <p className="text-sm text-[#8B7355] leading-relaxed">Chaque commande est vérifiée manuellement : validation de la disponibilité, estimation du délai de réalisation si recréation, contrôle visuel avant préparation. Nous documentons l'évolution des recréations pour certains projets afin de renforcer la confiance.</p>
          <ul className="text-sm list-disc list-inside space-y-1 text-[#8B7355]">
            <li>Contrôle couleur & texture</li>
            <li>Emballage soigné et neutre</li>
            <li>Support client réactif</li>
            <li>Historique de statut de commande transparent</li>
          </ul>
        </div>
        <div className="relative aspect-square rounded-lg overflow-hidden border border-[#D8D5C8] bg-[#E9E7DB]">
          {/* Remplace /about/process.jpg par le nom réel de ta deuxième image */}
          <Image
            src="/about/process.png"
            alt="Plan de travail d'atelier : pinceaux triés, pigments et toile en cours – processus & qualité"
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#6B2D2D]">Nous contacter</h2>
        <p className="text-sm text-[#8B7355]">Une question, un projet sur mesure ou un partenariat ? Écrivez‑nous.</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/contact" className="text-[#6B2D2D] underline underline-offset-4 hover:text-[#5A2525]">Formulaire de contact</Link>
          <a href="mailto:contact@example.com" className="text-[#6B2D2D] underline underline-offset-4 hover:text-[#5A2525]">contact@example.com</a>
        </div>
      </section>
    </div>
  )
}
