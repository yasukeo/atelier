'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[ErrorBoundary]', error)
  }, [error])

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-28">
      <h1 className="font-display text-5xl leading-[1.02] text-encre">La page n&apos;a pas pu s&apos;afficher.</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-encre/80 max-w-lg">
        Le serveur a rencontré un problème temporaire. Réessayez dans quelques instants.
      </p>
      <button onClick={() => reset()} className="btn-primaire mt-10">
        Réessayer
      </button>
    </div>
  )
}
