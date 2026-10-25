import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de remboursement',
  description: 'Politique de remboursement d\'Elwarcha - Conditions de retour et remboursement.',
}

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <p className="eyebrow">Retours</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-[1.02] text-encre">Politique de remboursement</h1>
      <div>
        <div className="texte-long mt-4">

          <section className="space-y-3">
            <h2>1. Œuvres originales</h2>
            <p>Chaque tableau est une pièce unique, peinte à la main. En raison de la nature artisanale de nos œuvres :</p>
            <ul>
              <li>Les ventes sont définitives une fois la commande confirmée</li>
              <li>Aucun retour n'est accepté sauf en cas de défaut de fabrication</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>2. Défauts et dommages</h2>
            <p>Si vous recevez un article endommagé ou défectueux :</p>
            <ul>
              <li>Contactez-nous dans les 48 heures suivant la réception</li>
              <li>Envoyez des photos du produit endommagé</li>
              <li>Nous vous proposerons un remplacement ou un remboursement</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>3. Commandes personnalisées</h2>
            <p>Les commandes sur mesure (reproductions, dimensions spéciales) ne sont ni remboursables ni échangeables, car elles sont créées spécifiquement pour vous.</p>
          </section>

          <section className="space-y-3">
            <h2>4. Annulation</h2>
            <p>Vous pouvez annuler votre commande :</p>
            <ul>
              <li>Dans les 24 heures suivant la commande, avant le début de la réalisation</li>
              <li>En nous contactant par email à <a href="mailto:contact@elwarcha.com" className="lien">contact@elwarcha.com</a></li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>5. Processus de remboursement</h2>
            <p>En cas de remboursement approuvé :</p>
            <ul>
              <li>Le remboursement sera effectué via le même mode de paiement utilisé</li>
              <li>Délai de traitement : 5 à 10 jours ouvrables</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>6. Contact</h2>
            <p>Pour toute demande de remboursement : <a href="mailto:contact@elwarcha.com" className="lien">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
