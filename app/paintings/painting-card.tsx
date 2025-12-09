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

export default function PaintingCard({ painting }: { painting: PaintingWithRels }) {
  const { images } = painting
  const [index, setIndex] = useState(0)
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
      <div className="relative aspect-[4/3] bg-[#EAE8DE]">
        {placeholder ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Aucune image</div>
        ) : (
          <Image
            key={current.id + index}
            src={current.url}
            alt={current.alt || painting.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover" />
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
    </div>
  )
}
