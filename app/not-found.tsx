import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-28">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-[1.02] text-encre">Cette page n&apos;est plus accrochée.</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-encre/80 max-w-lg">
        L&apos;adresse est peut-être erronée, ou l&apos;œuvre a été retirée de la galerie.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/paintings" className="btn-primaire">Voir la galerie</Link>
        <Link href="/" className="btn-secondaire">Accueil</Link>
      </div>
    </div>
  )
}
