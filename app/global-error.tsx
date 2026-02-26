'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#F7F5F0', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#6B2D2D', marginBottom: '0.75rem' }}>
            Une erreur est survenue
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#8B7355', marginBottom: '1.5rem', maxWidth: '28rem' }}>
            Le serveur a rencontré un problème temporaire. Veuillez réessayer dans quelques instants.
          </p>
          <button
            onClick={() => reset()}
            style={{ borderRadius: '9999px', border: '1px solid #D8D5C8', padding: '0 1.5rem', height: '2.75rem', fontSize: '0.875rem', fontWeight: 500, background: '#6B2D2D', color: 'white', cursor: 'pointer' }}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
