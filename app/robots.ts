import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/cart', '/checkout', '/profile', '/orders', '/signin', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: 'https://www.elwarcha.com/sitemap.xml',
  }
}
