import { describe, it, expect } from 'vitest'
import { parsePaintingFilters } from '@/lib/painting-filters'

describe('parsePaintingFilters', () => {
  it('parses numeric ranges, kind and sort', () => {
    expect(parsePaintingFilters({ minPrice: '100', maxPrice: '900', kind: 'UNIQUE', sort: 'price-asc' }))
      .toEqual({ minPrice: 100, maxPrice: 900, kind: 'UNIQUE', sort: 'price-asc' })
  })
  it('ignores everything when a value is invalid', () => {
    expect(parsePaintingFilters({ sort: 'random' })).toEqual({})
    expect(parsePaintingFilters({ minPrice: '900', maxPrice: '100' })).toEqual({})
  })
  it('takes the first value of repeated params', () => {
    expect(parsePaintingFilters({ q: ['soir', 'nuit'] })).toEqual({ q: 'soir' })
  })
})
