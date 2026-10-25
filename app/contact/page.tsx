import { ContactForm } from './ContactForm.client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: "Contactez Elwarcha الورشة pour toute question sur une œuvre, une commande sur mesure ou un partenariat. Réponse rapide.",
  alternates: { canonical: 'https://www.elwarcha.com/contact' },
}

export const dynamic = 'force-dynamic'

const TOPICS = [
  'Une question sur une œuvre, son format ou son délai',
  'Une commande sur mesure, dans le même esprit qu\'une œuvre vendue',
  'Le suivi d\'une commande en cours',
]

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string | string[] }> }) {
  // Pre-filled from links such as "Poser une question sur cette œuvre" on painting pages
  const { subject } = await searchParams
  const defaultSubject = typeof subject === 'string' ? subject.slice(0, 120) : undefined
  return (
    <div className="max-w-[88rem] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24 grid gap-14 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5 space-y-8">
        <h1 className="font-display text-6xl sm:text-7xl leading-none text-encre">Écrire à l&apos;atelier</h1>
        <p className="text-[16px] leading-relaxed text-encre/80 max-w-md">
          L&apos;atelier lit chaque message et répond par email. Vous pouvez nous écrire pour :
        </p>
        <ul className="space-y-3 text-[15px] text-encre/85 max-w-md">
          {TOPICS.map(t => (
            <li key={t} className="flex gap-3"><span aria-hidden="true" className="text-grenat">—</span>{t}</li>
          ))}
        </ul>
        <div className="border-t border-trait pt-6 text-[15px]">
          <p className="eyebrow mb-2">Par email</p>
          <a href="mailto:contact@elwarcha.com" className="lien">contact@elwarcha.com</a>
        </div>
      </div>
      <div className="lg:col-span-7 border-t-2 border-encre pt-8">
        <ContactForm defaultSubject={defaultSubject} />
      </div>
    </div>
  )
}
