import { z } from 'zod'

// Price stored as priceMAD (Int)
export const paintingFilterSchema = z.object({
  q: z.string().trim().min(1).max(100).optional(),
  artist: z.string().cuid().optional(),
  style: z.string().cuid().optional(),
  technique: z.string().cuid().optional(),
  minPrice: z.coerce.number().int().min(0).max(1_000_000).optional(),
  maxPrice: z.coerce.number().int().min(0).max(1_000_000).optional(),
  minWidth: z.coerce.number().int().min(1).max(1000).optional(),
  maxWidth: z.coerce.number().int().min(1).max(1000).optional(),
  minHeight: z.coerce.number().int().min(1).max(1000).optional(),
  maxHeight: z.coerce.number().int().min(1).max(1000).optional(),
  kind: z.enum(['UNIQUE','RECREATABLE']).optional(),
  // Future color palette filter placeholder
  colors: z.string().optional(),
}).refine(d => !d.minPrice || !d.maxPrice || d.minPrice <= d.maxPrice, { message: 'minPrice > maxPrice', path: ['minPrice'] })
  .refine(d => !d.minWidth || !d.maxWidth || d.minWidth <= d.maxWidth, { message: 'minWidth > maxWidth', path: ['minWidth'] })
  .refine(d => !d.minHeight || !d.maxHeight || d.minHeight <= d.maxHeight, { message: 'minHeight > maxHeight', path: ['minHeight'] })

export type PaintingFilters = z.infer<typeof paintingFilterSchema>

export function parsePaintingFilters(params: Record<string, string | string[] | undefined>): PaintingFilters {
  const flat: Record<string,string> = {}
  for (const [k,v] of Object.entries(params)) {
    if (Array.isArray(v)) flat[k] = v[0] ?? ''
    else if (typeof v === 'string') flat[k] = v
  }
  const res = paintingFilterSchema.safeParse(flat)
  if (!res.success) return {}
  return res.data
}
