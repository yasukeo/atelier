export const fr = {
  auth: {
    signIn: {
      title: "Connexion",
      email: "E-mail",
      password: "Mot de passe",
      submit: "Se connecter",
      error: "Identifiants invalides",
    },
  },
  nav: {
    home: "Accueil",
    admin: "Admin",
  },
  home: {
    hero: {
      title: "Elwarcha | الورشة — Peintures artisanales",
      description: "Tableaux originaux peints à la main au Maroc. Commandez une œuvre unique ou une reproduction personnalisée.",
      ctaGallery: "Explorer les œuvres",
      prompt: "Nouveautés",
      previewCaption: "Aperçu",
      noImage: "Aucune image",
    },
    featured: {
      title: "Nouvelles œuvres",
      all: "Tout voir →",
      none: "Aucune peinture pour le moment.",
    },
    categories: {
      title: "Explorer par style & technique",
      none: "Aucun style ou technique défini.",
      note: "Sélectionnez un style ou une technique pour affiner votre recherche dans une prochaine mise à jour. De nouvelles catégories seront ajoutées au fur et à mesure.",
    },
    process: {
      blocks: {
        quality: { kicker: "Qualité", title: "Œuvres originales & re-créations", text: "Chaque peinture originale est unique. Les re-créations suivent fidèlement la composition tout en conservant une touche artisanale." },
        customization: { kicker: "Personnalisation", title: "Formats & adaptations", text: "Adaptez les dimensions ou demandez une variation chromatique. Nous vous conseillons selon votre espace." },
        trust: { kicker: "Confiance", title: "Suivi transparent", text: "Vous serez informé des étapes clés de réalisation et de préparation avant livraison ou retrait." },
      }
    },
    advancePayment: {
      title: "Note sur les avances",
      text: "Certaines œuvres, notamment les re-créations ou commandes personnalisées, peuvent nécessiter une avance avant le début de la réalisation. Vous serez contacté(e) pour convenir des modalités.",
      shortText: "Une avance peut être demandée pour certaines œuvres."
    },
    footer: {
      copyright: (year: number) => `© ${year} Elwarcha – Tous droits réservés.`
    }
  }
} as const

type Dict = typeof fr

// Basic translator: returns string. If the stored value is a function without provided args,
// we call it with no arguments. For parametrized strings, expose tFn instead.
export function t(path: string, dict: Dict = fr): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, dict)
  if (typeof value === 'string') return value
  if (typeof value === 'function') {
    try { return (value as (...a: unknown[]) => string)() } catch { return path }
  }
  return path
}

// When you need to pass parameters to a functional translation, use tFn.
export function tFn(path: string, dict: Dict = fr): ((...args: unknown[]) => string) | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, dict)
  if (typeof value === 'function') return value as (...args: unknown[]) => string
  return undefined
}

// Retrieve a nested object (e.g., block of kicker/title/text). Returns unknown so caller can narrow.
export function tObj<T = unknown>(path: string, dict: Dict = fr): T | undefined {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, dict)
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as T
  return undefined
}
