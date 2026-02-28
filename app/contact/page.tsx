import { ContactCard } from './ContactForm.client'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: "Contactez Elwarcha الورشة pour toute question sur une œuvre, une commande sur mesure ou un partenariat. Réponse rapide.",
  alternates: { canonical: 'https://www.elwarcha.com/contact' },
}

export const dynamic = 'force-dynamic'


export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[#6B2D2D]">Contact</h1>
        <p className="text-sm text-[#8B7355] max-w-xl mx-auto">Une question sur une œuvre, une commande sur mesure ou un partenariat ? Écris‑nous via ce formulaire, nous répondons rapidement.</p>
      </div>
      <ContactCard />
      <div className="text-xs text-[#8B7355]">
        En alternative directe : <a href="mailto:contact@elwarcha.com" className="text-[#6B2D2D] underline underline-offset-4">contact@elwarcha.com</a>
      </div>
    </div>
  )
}
