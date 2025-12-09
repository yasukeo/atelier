import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de remboursement | Elwarcha',
  description: 'Politique de remboursement d\'Elwarcha - Conditions de retour et remboursement.',
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#6B2D2D] mb-8">Politique de remboursement</h1>
        
        <div className="prose prose-sm text-[#2D2A26] space-y-6">
          <p className="text-[#8B7355]">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">1. Œuvres originales</h2>
            <p>Chaque tableau est une pièce unique, peinte à la main. En raison de la nature artisanale de nos œuvres :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Les ventes sont définitives une fois la commande confirmée</li>
              <li>Aucun retour n'est accepté sauf en cas de défaut de fabrication</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">2. Défauts et dommages</h2>
            <p>Si vous recevez un article endommagé ou défectueux :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Contactez-nous dans les 48 heures suivant la réception</li>
              <li>Envoyez des photos du produit endommagé</li>
              <li>Nous vous proposerons un remplacement ou un remboursement</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">3. Commandes personnalisées</h2>
            <p>Les commandes sur mesure (reproductions, dimensions spéciales) ne sont ni remboursables ni échangeables, car elles sont créées spécifiquement pour vous.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">4. Annulation</h2>
            <p>Vous pouvez annuler votre commande :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Dans les 24 heures suivant la commande, avant le début de la réalisation</li>
              <li>En nous contactant par email à <a href="mailto:contact@elwarcha.com" className="text-[#6B2D2D] underline">contact@elwarcha.com</a></li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">5. Processus de remboursement</h2>
            <p>En cas de remboursement approuvé :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Le remboursement sera effectué via le même mode de paiement utilisé</li>
              <li>Délai de traitement : 5 à 10 jours ouvrables</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">6. Contact</h2>
            <p>Pour toute demande de remboursement : <a href="mailto:contact@elwarcha.com" className="text-[#6B2D2D] underline">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
