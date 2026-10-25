import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Politique d'expédition",
  description: "Politique d'expédition d'Elwarcha - Délais et conditions de livraison.",
}

export default function ShippingPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <p className="eyebrow">Livraison</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-[1.02] text-encre">Politique d'expédition</h1>
      <div>
        <div className="texte-long mt-4">

          <section className="space-y-3">
            <h2>1. Zones de livraison</h2>
            <p>Nous livrons actuellement dans tout le Maroc.</p>
            <ul>
              <li>Casablanca et région : 2-3 jours ouvrables</li>
              <li>Autres villes principales : 3-5 jours ouvrables</li>
              <li>Zones rurales : 5-7 jours ouvrables</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>2. Délais de fabrication</h2>
            <p>Nos œuvres étant peintes à la main :</p>
            <ul>
              <li>Tableaux en stock : expédition sous 2-3 jours</li>
              <li>Reproductions : 1-2 semaines selon la complexité</li>
              <li>Œuvres sur mesure : 2-4 semaines</li>
            </ul>
            <p>Vous serez informé par email à chaque étape de votre commande.</p>
            <p className="border-l-2 border-safran pl-4 text-pierre">Note : Pour certaines œuvres (re-créations, commandes personnalisées), une avance peut être demandée avant le début de la réalisation.</p>
          </section>

          <section className="space-y-3">
            <h2>3. Frais de livraison</h2>
            <ul>
              <li>Livraison gratuite pour les commandes supérieures à 500 MAD</li>
              <li>Frais standard : selon la destination et la taille du tableau</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>4. Emballage</h2>
            <p>Chaque tableau est soigneusement emballé pour garantir une livraison en parfait état :</p>
            <ul>
              <li>Protection des coins</li>
              <li>Film de protection</li>
              <li>Carton renforcé</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>5. Suivi de commande</h2>
            <p>Vous recevrez des notifications par email :</p>
            <ul>
              <li>Confirmation de commande</li>
              <li>Début de la réalisation</li>
              <li>Expédition avec numéro de suivi</li>
              <li>Livraison effectuée</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>6. Retrait en atelier</h2>
            <p>Le retrait en atelier est possible sur rendez-vous à Rabat. Contactez-nous pour organiser le retrait.</p>
          </section>

          <section className="space-y-3">
            <h2>7. Contact</h2>
            <p>Pour toute question sur votre livraison : <a href="mailto:contact@elwarcha.com" className="lien">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
