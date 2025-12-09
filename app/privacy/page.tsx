import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Elwarcha',
  description: 'Politique de confidentialité d\'Elwarcha - Comment nous protégeons vos données personnelles.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#6B2D2D] mb-8">Politique de confidentialité</h1>
        
        <div className="prose prose-sm text-[#2D2A26] space-y-6">
          <p className="text-[#8B7355]">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">1. Collecte des données</h2>
            <p>Nous collectons les informations que vous nous fournissez directement lors de :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>La création de votre compte (nom, email, mot de passe)</li>
              <li>La passation d'une commande (adresse de livraison, téléphone)</li>
              <li>L'utilisation du formulaire de contact</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter concernant votre commande</li>
              <li>Répondre à vos questions via le formulaire de contact</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">3. Protection des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation ou destruction.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">4. Partage des données</h2>
            <p>Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Services de livraison pour l'expédition de vos commandes</li>
              <li>Obligations légales</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">5. Vos droits</h2>
            <p>Vous avez le droit de :</p>
            <ul className="list-disc pl-6 space-y-2 text-[#8B7355]">
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos données</li>
              <li>Supprimer votre compte</li>
              <li>Vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[#6B2D2D]">6. Contact</h2>
            <p>Pour toute question concernant cette politique, contactez-nous à : <a href="mailto:contact@elwarcha.com" className="text-[#6B2D2D] underline">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
