import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Conditions d'utilisation | Elwarcha",
  description: "Conditions générales d'utilisation du site Elwarcha.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#6B2D2D] mb-8">Conditions d'utilisation</h1>
        
        <div className="prose prose-sm text-[#2D2A26] space-y-6">
          <p className="text-[#8B7355]">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">1. Acceptation des conditions</h2>
            <p>En accédant et en utilisant le site elwarcha.com, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">2. Description du service</h2>
            <p>Elwarcha est une galerie d'art en ligne proposant :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Des tableaux originaux peints à la main</li>
              <li>Des reproductions et œuvres personnalisées</li>
              <li>Un service de commande sur mesure</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">3. Compte utilisateur</h2>
            <p>Pour passer commande, vous devez créer un compte. Vous êtes responsable de :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Maintenir la confidentialité de votre mot de passe</li>
              <li>Toutes les activités effectuées sous votre compte</li>
              <li>Nous informer de toute utilisation non autorisée</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">4. Commandes et paiement</h2>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Les prix sont affichés en Dirhams marocains (MAD)</li>
              <li>Le paiement est dû au moment de la commande</li>
              <li>Nous nous réservons le droit de refuser ou d'annuler une commande</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">5. Propriété intellectuelle</h2>
            <p>Tous les contenus du site (images, textes, logos, œuvres d'art) sont protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">6. Limitation de responsabilité</h2>
            <p>Elwarcha ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du site ou de l'impossibilité d'y accéder.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">7. Modifications</h2>
            <p>Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">8. Contact</h2>
            <p>Pour toute question : <a href="mailto:contact@elwarcha.com" className="text-[#6B2D2D] underline">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
