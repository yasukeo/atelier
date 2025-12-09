import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Politique d'expédition | Elwarcha",
  description: "Politique d'expédition d'Elwarcha - Délais et conditions de livraison.",
}

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#6B2D2D] mb-8">Politique d'expédition</h1>
        
        <div className="prose prose-sm text-[#2D2A26] space-y-6">
          <p className="text-[#8B7355]">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">1. Zones de livraison</h2>
            <p>Nous livrons actuellement dans tout le Maroc.</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Casablanca et région : 2-3 jours ouvrables</li>
              <li>Autres villes principales : 3-5 jours ouvrables</li>
              <li>Zones rurales : 5-7 jours ouvrables</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">2. Délais de fabrication</h2>
            <p>Nos œuvres étant peintes à la main :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Tableaux en stock : expédition sous 2-3 jours</li>
              <li>Reproductions : 1-2 semaines selon la complexité</li>
              <li>Œuvres sur mesure : 2-4 semaines</li>
            </ul>
            <p>Vous serez informé par email à chaque étape de votre commande.</p>
            <p className="text-sm italic text-[#8B7355]">Note : Pour certaines œuvres (re-créations, commandes personnalisées), une avance peut être demandée avant le début de la réalisation.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">3. Frais de livraison</h2>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Livraison gratuite pour les commandes supérieures à 500 MAD</li>
              <li>Frais standard : selon la destination et la taille du tableau</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">4. Emballage</h2>
            <p>Chaque tableau est soigneusement emballé pour garantir une livraison en parfait état :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Protection des coins</li>
              <li>Film de protection</li>
              <li>Carton renforcé</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">5. Suivi de commande</h2>
            <p>Vous recevrez des notifications par email :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Confirmation de commande</li>
              <li>Début de la réalisation</li>
              <li>Expédition avec numéro de suivi</li>
              <li>Livraison effectuée</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">6. Retrait en atelier</h2>
            <p>Le retrait en atelier est possible sur rendez-vous à Rabat. Contactez-nous pour organiser le retrait.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">7. Contact</h2>
            <p>Pour toute question sur votre livraison : <a href="mailto:contact@elwarcha.com" className="text-[#6B2D2D] underline">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
