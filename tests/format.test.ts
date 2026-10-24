import { describe, it, expect } from 'vitest'
import { cloudinaryBlurUrl, escapeHtml, formatDimensions, formatMAD, safeCallbackUrl } from '@/lib/format'

describe('formatMAD', () => {
  it('formats whole dirhams without decimals', () => {
    const out = formatMAD(2200)
    expect(out).toContain('MAD')
    expect(out.replace(/\D/g, '')).toBe('2200')
  })
})

describe('formatDimensions', () => {
  it('renders width × height in cm', () => {
    expect(formatDimensions(60, 80)).toBe('60 × 80 cm')
  })
})

describe('safeCallbackUrl', () => {
  it('keeps same-origin relative paths', () => {
    expect(safeCallbackUrl('/checkout?discount=X')).toBe('/checkout?discount=X')
  })
  it('rejects absolute and protocol-relative URLs (open redirect)', () => {
    expect(safeCallbackUrl('https://evil.example')).toBe('/')
    expect(safeCallbackUrl('//evil.example')).toBe('/')
    expect(safeCallbackUrl('/\\evil.example')).toBe('/')
  })
  it('falls back when empty', () => {
    expect(safeCallbackUrl(null, '/home')).toBe('/home')
  })
})

describe('escapeHtml', () => {
  it('neutralizes markup in user-provided text', () => {
    expect(escapeHtml(`<img src=x onerror="a">&'`)).toBe('&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;')
  })
})

describe('cloudinaryBlurUrl', () => {
  it('builds a tiny blurred Cloudinary variant', () => {
    expect(cloudinaryBlurUrl('https://res.cloudinary.com/demo/image/upload/v1/atelier/a.jpg'))
      .toBe('https://res.cloudinary.com/demo/image/upload/w_40,e_blur:200,q_auto:low/v1/atelier/a.jpg')
  })
  it('returns undefined for local images', () => {
    expect(cloudinaryBlurUrl('/paintings/demo/a.jpg')).toBeUndefined()
  })
})
