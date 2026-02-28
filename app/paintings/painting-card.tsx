"use client"
import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Painting, Artist, PaintingImage } from '@prisma/client'
import { cn } from '@/lib/utils'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface PaintingWithRels extends Painting {
  artist: Artist
  images: PaintingImage[]
}

/* ─── Lightbox (fullscreen overlay) ─── */
function Lightbox({ images, startIndex, painting, onClose }: {
  images: PaintingImage[]
  startIndex: number
  painting: PaintingWithRels
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const total = images.length
  const go = useCallback((dir: number) => setIdx(i => (i + dir + total) % total), [total])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, go])

  const current = images[idx]
  if (!current) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center" onClick={onClose}>
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4 flex items-center justify-center" onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl transition"
          aria-label="Fermer"
        >
          ✕
        </button>

        {/* Image */}
        <div className="relative w-full h-full">
          <Image
            src={current.url}
            alt={current.alt || painting.title}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Nav arrows */}
        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition"
              aria-label="Précédent"
            >
              ‹
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl transition"
              aria-label="Suivant"
            >
              ›
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setIdx(i)}
                className={cn("h-2.5 w-2.5 rounded-full border border-white/60 transition", i === idx ? 'bg-white' : 'bg-white/30 hover:bg-white/60')}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Caption */}
        <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
          <p className="text-white/80 text-sm font-medium drop-shadow">{painting.title} — {painting.artist?.name}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Cloudinary blur placeholder helper ─── */
function cloudinaryBlurUrl(url: string): string {
  // Transform Cloudinary URL to a tiny blurred version for placeholder
  // e.g. .../upload/v123/... → .../upload/w_40,e_blur:200,q_auto:low/v123/...
  try {
    return url.replace('/upload/', '/upload/w_40,e_blur:200,q_auto:low/')
  } catch {
    return url
  }
}

/* ─── Painting Card ─── */
export default function PaintingCard({ painting, priority = false }: { painting: PaintingWithRels; priority?: boolean }) {
  const { images } = painting
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const imgs = images.length ? images : []
  const total = imgs.length
  const go = useCallback((dir: number) => {
    if (!total) return
    setIndex(i => (i + dir + total) % total)
  }, [total])
  const goTo = useCallback((i: number) => setIndex(i), [])
  const keyListener = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(-1)
    if (e.key === 'ArrowRight') go(1)
  }, [go])
  const cardRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => keyListener(e)
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [keyListener])

  const current = imgs[index]
  const placeholder = !current
  const [isPending, startTransition] = useTransition()

  function addToCart() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/cart-add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paintingId: painting.id, quantity: 1 }) })
        if (!res.ok) throw new Error('Erreur')
        const json = await res.json()
        if (json.ok) {
          window.dispatchEvent(new Event('cart:changed'))
          toast.success('Ajouté au panier')
        } else {
          toast.error('Impossible d\'ajouter')
        }
      } catch {
        toast.error('Erreur')
      }
    })
  }
  return (
    <div
      ref={cardRef}
      tabIndex={0}
      className="group rounded-lg sm:rounded-xl border border-[#DCD9CC] bg-[#FDFCFA] shadow-sm hover:shadow-md transition overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#6B2D2D]/50"
      aria-roledescription="carousel" aria-label={painting.title}
    >
      <div className="relative aspect-[4/5] bg-[#EAE8DE] overflow-hidden cursor-zoom-in" onDoubleClick={() => !placeholder && setLightboxOpen(true)}>
        {placeholder ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Aucune image</div>
        ) : (
          <Image
            key={current.id + index}
            src={current.url}
            alt={current.alt || painting.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover"
            priority={priority}
            placeholder="blur"
            blurDataURL={cloudinaryBlurUrl(current.url)}
          />
        )}
        {total > 1 && (
          <>
            <button
              aria-label="Précédent"
              onClick={() => go(-1)}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition text-sm sm:text-base"
            >
              ‹
            </button>
            <button
              aria-label="Suivant"
              onClick={() => go(1)}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100 transition text-sm sm:text-base"
            >
              ›
            </button>
            <div className="absolute bottom-1.5 sm:bottom-2 left-0 right-0 flex justify-center gap-1">
              {imgs.map((img, i) => (
                <button
                  key={img.id}
                  aria-label={`Voir image ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full border border-white", i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/60')}
                />
              ))}
            </div>
          </>
        )}
        {painting.available === false && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[10px] sm:text-xs font-medium text-white px-2 py-1 bg-black/50 rounded">Indisponible</span>
          </div>
        )}
        {/* Expand hint */}
        {!placeholder && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/40 hover:bg-black/60 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
            aria-label="Voir en grand"
            title="Double-clic ou cliquez pour agrandir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        )}
      </div>
      <div className="p-2 sm:p-3 space-y-1">
        <h2 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2" title={painting.title}>{painting.title}</h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap gap-1">
          <span>{painting.artist?.name}</span>
          <span className="text-muted-foreground/40 hidden sm:inline">·</span>
          <span className="hidden sm:inline">{painting.widthCm}×{painting.heightCm}cm</span>
        </p>
        <p className="text-xs sm:text-sm font-medium text-[#6B2D2D]">{painting.priceMAD} MAD</p>
        {painting.kind === 'RECREATABLE' && (
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400 font-medium">Recréable</p>
        )}
        <div className="pt-1.5 sm:pt-2 flex items-center gap-2">
          <Button
            size="sm"
            disabled={isPending || painting.available === false}
            onClick={addToCart}
            variant="secondary"
            className="text-xs h-8 sm:h-9 px-2 sm:px-3"
          >
            {painting.kind === 'UNIQUE' ? 'Réserver' : 'Ajouter'}
          </Button>
          {painting.kind === 'UNIQUE' && <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground hidden sm:inline">Pièce unique</span>}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {lightboxOpen && imgs.length > 0 && (
        <Lightbox
          images={imgs}
          startIndex={index}
          painting={painting}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
