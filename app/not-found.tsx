import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-[#D97706] mb-2">Erreur 404</p>
      <h1 className="text-2xl sm:text-3xl font-semibold text-[#6B2D2D] mb-3">Page introuvable</h1>
      <p className="text-sm text-[#8B7355] mb-6 max-w-md">
        Cette page n&apos;existe pas ou l&apos;œuvre a été retirée de la galerie.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/paintings" className="inline-flex items-center justify-center rounded-full px-6 h-11 text-sm font-medium bg-[#6B2D2D] text-white hover:bg-[#5A2525] transition">
          Voir la galerie
        </Link>
        <Link href="/" className="inline-flex items-center justify-center rounded-full px-6 h-11 text-sm font-medium border border-[#D8D5C8] text-[#6B2D2D] hover:bg-[#E9E7DB] transition">
          Accueil
        </Link>
      </div>
    </div>
  )
}
