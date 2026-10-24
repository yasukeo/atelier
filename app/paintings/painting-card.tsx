"use client"
import { useState, useCallback, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Painting, Artist, PaintingImage } from '@prisma/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Lightbox } from '@/components/Lightbox'
import { cloudinaryBlurUrl, formatMAD } from '@/lib/format'

interface PaintingWithRels extends Painting {
  artist: Artist
  images: PaintingImage[]
  recreationOptions?: { priceMAD: number }[] // lets RECREATABLE cards show their lowest price
}

/* ─── Painting Card ─── */
export default function PaintingCard({ painting, priority = false }: { painting: PaintingWithRels; priority?: boolean }) {
  const imgs = painting.images
  const total = imgs.length
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const go = useCallback((dir: number) => {
    if (!total) return
    setIndex(i => (i + dir + total) % total)
  }, [total])

  const href = `/paintings/${painting.id}`
  const current = imgs[index]
  const isUnique = painting.kind === 'UNIQUE'
  const soldOut = painting.available === false
  const optionPrices = painting.recreationOptions?.map(o => o.priceMAD) ?? []
  const fromPrice = Math.min(painting.priceMAD, ...optionPrices)
  const hasSeveralPrices = !isUnique && optionPrices.some(p => p !== painting.priceMAD)

  function addToCart() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/cart-add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paintingId: painting.id, quantity: 1 }) })
        const json = await res.json().catch(() => null)
        if (json?.ok) {
          window.dispatchEvent(new Event('cart:changed'))
          toast.success('Ajouté au panier', { action: { label: 'Voir le panier', onClick: () => router.push('/cart') } })
        } else if (json?.error === 'UNAVAILABLE') {
          toast.error("Cette œuvre vient d'être vendue")
        } else {
          toast.error("Impossible d'ajouter au panier")
        }
      } catch {
        toast.error('Erreur réseau, réessayez')
      }
    })
  }

  return (
    <div className="group rounded-lg sm:rounded-xl border border-[#DCD9CC] bg-[#FDFCFA] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div className="relative aspect-[4/5] bg-[#EAE8DE] overflow-hidden">
        {current ? (
          <Image
            key={current.id}
            src={current.url}
            alt={current.alt || painting.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            priority={priority}
            {...(cloudinaryBlurUrl(current.url) ? { placeholder: 'blur' as const, blurDataURL: cloudinaryBlurUrl(current.url) } : {})}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Aucune image</div>
        )}
        {/* Whole image links to the detail page; controls below sit above this layer */}
        <Link href={href} className="absolute inset-0" aria-label={`Voir ${painting.title}`} />
        {total > 1 && (
          <>
            <button
              aria-label="Image précédente"
              onClick={() => go(-1)}
              className="absolute z-10 left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition text-sm sm:text-base"
            >
              ‹
            </button>
            <button
              aria-label="Image suivante"
              onClick={() => go(1)}
              className="absolute z-10 right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition text-sm sm:text-base"
            >
              ›
            </button>
            <div className="absolute z-10 bottom-1.5 sm:bottom-2 left-0 right-0 flex justify-center gap-1">
              {imgs.map((img, i) => (
                <button
                  key={img.id}
                  aria-label={`Voir image ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full border border-white", i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/60')}
                />
              ))}
            </div>
          </>
        )}
        {soldOut && (
          <span className="absolute z-10 top-2 left-2 text-[10px] sm:text-xs font-medium text-white px-2 py-1 bg-[#6B2D2D]/90 rounded">
            {isUnique ? 'Vendu' : 'Indisponible'}
          </span>
        )}
        {current && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute z-10 top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/40 hover:bg-black/60 text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition"
            aria-label="Agrandir l'image"
            title="Agrandir"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
        )}
      </div>
      <div className="p-2 sm:p-3 space-y-1 flex-1 flex flex-col">
        <h2 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2" title={painting.title}>
          <Link href={href} className="hover:text-[#6B2D2D]">{painting.title}</Link>
        </h2>
        <p className="text-[10px] sm:text-xs text-muted-foreground flex flex-wrap gap-1">
          <span>{painting.artist?.name}</span>
          <span className="text-muted-foreground/40 hidden sm:inline">·</span>
          <span className="hidden sm:inline">{painting.widthCm}×{painting.heightCm} cm</span>
        </p>
        <p className="text-xs sm:text-sm font-medium text-[#6B2D2D]">
          {hasSeveralPrices && <span className="text-[10px] sm:text-xs font-normal text-[#8B7355]">dès </span>}
          {formatMAD(hasSeveralPrices ? fromPrice : painting.priceMAD)}
        </p>
        <div className="mt-auto pt-1.5 sm:pt-2 flex items-center gap-2">
          {isUnique ? (
            <>
              <Button
                size="sm"
                disabled={isPending || soldOut}
                onClick={addToCart}
                variant="secondary"
                className="text-xs h-8 sm:h-9 px-2 sm:px-3"
              >
                {soldOut ? 'Vendu' : 'Réserver'}
              </Button>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-muted-foreground hidden sm:inline">Pièce unique</span>
            </>
          ) : (
            <>
              <Button size="sm" variant="secondary" className="text-xs h-8 sm:h-9 px-2 sm:px-3" asChild>
                <Link href={href}>Choisir un format</Link>
              </Button>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-amber-700 font-medium hidden sm:inline">Recréable</span>
            </>
          )}
        </div>
      </div>

      {lightboxOpen && total > 0 && (
        <Lightbox
          images={imgs}
          startIndex={index}
          caption={`${painting.title} — ${painting.artist?.name ?? ''}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
