import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité d\'Elwarcha - Comment nous protégeons vos données personnelles.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <p className="eyebrow">Données personnelles</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-[1.02] text-encre">Politique de confidentialité</h1>
      <div>
        <div className="texte-long mt-4">

          <section className="space-y-3">
            <h2>1. Collecte des données</h2>
            <p>Nous collectons les informations que vous nous fournissez directement lors de :</p>
            <ul>
              <li>La création de votre compte (nom, email, mot de passe)</li>
              <li>La passation d'une commande (adresse de livraison, téléphone)</li>
              <li>L'utilisation du formulaire de contact</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>2. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter concernant votre commande</li>
              <li>Répondre à vos questions via le formulaire de contact</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>3. Protection des données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre tout accès non autorisé, modification, divulgation ou destruction.</p>
          </section>

          <section className="space-y-3">
            <h2>4. Partage des données</h2>
            <p>Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf dans les cas suivants :</p>
            <ul>
              <li>Services de livraison pour l'expédition de vos commandes</li>
              <li>Obligations légales</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>5. Vos droits</h2>
            <p>Vous avez le droit de :</p>
            <ul>
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier vos données</li>
              <li>Supprimer votre compte</li>
              <li>Vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2>6. Contact</h2>
            <p>Pour toute question concernant cette politique, contactez-nous à : <a href="mailto:contact@elwarcha.com" className="lien">contact@elwarcha.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
