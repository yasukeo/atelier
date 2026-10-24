import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

// Regenerated hourly so new paintings get discovered by search engines
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://www.elwarcha.com'
  const now = new Date()

  let paintings: { id: string; updatedAt: Date; images: { url: string }[] }[] = []
  try {
    paintings = await prisma.painting.findMany({
      where: { available: true },
      select: { id: true, updatedAt: true, images: { select: { url: true }, orderBy: { position: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    })
  } catch {
    // DB unreachable: still serve the static pages
  }

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${base}/paintings`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/shipping`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${base}/refund`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...paintings.map(p => ({
      url: `${base}/paintings/${p.id}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      images: p.images.filter(i => i.url.startsWith('http')).map(i => i.url),
    })),
  ]
}
