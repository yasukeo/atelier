'use client'

// Rendered instead of the root layout, so it cannot rely on the site's CSS or fonts
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#FAF8F4', color: '#1C1915', margin: 0 }}>
        <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '6rem 1.25rem' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: '2.5rem', lineHeight: 1.05, margin: '0 0 1.25rem' }}>
            La page n&apos;a pas pu s&apos;afficher.
          </h1>
          <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#6B6258', margin: '0 0 2.5rem' }}>
            Le serveur a rencontré un problème temporaire. Réessayez dans quelques instants.
          </p>
          <button
            onClick={() => reset()}
            style={{ borderRadius: '2px', border: 0, padding: '0 1.5rem', height: '2.75rem', fontSize: '0.875rem', fontWeight: 500, background: '#7A2314', color: 'white', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
