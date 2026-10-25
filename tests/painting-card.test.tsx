import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }))
// next/image needs the Next runtime; a plain <img> is enough here
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

import PaintingCard from '@/app/paintings/painting-card'

const base = {
  id: 'cm0painting0000000000001',
  title: 'Soir sur la médina',
  description: null,
  priceMAD: 1800,
  widthCm: 70,
  heightCm: 50,
  orientation: 'PAYSAGE' as const,
  colorTags: null,
  available: true,
  leadTimeWeeks: null,
  artistId: 'a1',
  styleId: null,
  techniqueId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  artist: { id: 'a1', name: 'Atelier Elwarcha', bio: null, createdAt: new Date(), updatedAt: new Date() },
  images: [{ id: 'i1', paintingId: 'cm0painting0000000000001', url: '/paintings/demo/a.jpg', alt: 'Soir', position: 0 }],
}

describe('PaintingCard', () => {
  it('is a single link to the painting detail page', () => {
    render(<PaintingCard painting={{ ...base, kind: 'UNIQUE' }} />)
    const link = screen.getByRole('link', { name: base.title })
    expect(link).toHaveAttribute('href', `/paintings/${base.id}`)
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByText('Pièce unique')).toBeInTheDocument()
    expect(screen.getByText('70 × 50 cm')).toBeInTheDocument()
  })

  it('marks sold originals as sold', () => {
    render(<PaintingCard painting={{ ...base, kind: 'UNIQUE', available: false }} />)
    expect(screen.getByText('Vendue')).toBeInTheDocument()
  })

  it('shows the lowest price of recreatable paintings', () => {
    render(<PaintingCard painting={{ ...base, kind: 'RECREATABLE', recreationOptions: [{ priceMAD: 1200 }, { priceMAD: 2900 }] }} />)
    expect(screen.getByText('Re-création sur commande')).toBeInTheDocument()
    expect(screen.getByText(/dès/)).toBeInTheDocument()
    expect(screen.getByText(/1.200/)).toBeInTheDocument()
  })
})
