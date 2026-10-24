const madFormatter = new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })

export function formatMAD(value: number): string {
  return madFormatter.format(value)
}

export function formatDimensions(widthCm: number, heightCm: number): string {
  return `${widthCm} × ${heightCm} cm`
}

// Only allow same-origin relative paths as post-login redirect targets (prevents open redirects).
export function safeCallbackUrl(raw: string | null | undefined, fallback = '/'): string {
  if (!raw) return fallback
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback
  return raw
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isCloudinaryUrl(url: string): boolean {
  return url.startsWith('https://res.cloudinary.com/')
}

// Tiny blurred Cloudinary variant used as next/image placeholder (undefined for non-Cloudinary URLs).
export function cloudinaryBlurUrl(url: string): string | undefined {
  if (!isCloudinaryUrl(url)) return undefined
  return url.replace('/upload/', '/upload/w_40,e_blur:200,q_auto:low/')
}
