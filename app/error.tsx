'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h2 className="text-2xl font-semibold text-[#6B2D2D] mb-3">Une erreur est survenue</h2>
      <p className="text-sm text-[#8B7355] mb-6 max-w-md">
        Le serveur a rencontré un problème temporaire. Veuillez réessayer dans quelques instants.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full border border-[#D8D5C8] px-6 h-11 text-sm font-medium bg-[#6B2D2D] text-white hover:bg-[#5A2525] transition"
      >
        Réessayer
      </button>
    </div>
  )
}
