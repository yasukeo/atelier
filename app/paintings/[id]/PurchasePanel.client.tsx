"use client"
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { formatDimensions, formatMAD } from '@/lib/format'
import { ScaleDrawing } from '@/components/ScaleDrawing'

interface FormatOption { key: string; widthCm: number; heightCm: number; priceMAD: number; isOriginal: boolean }

interface Props {
  paintingId: string
  title: string
  kind: 'UNIQUE' | 'RECREATABLE'
  available: boolean
  priceMAD: number
  widthCm: number
  heightCm: number
  leadTimeWeeks: string | null
  options: { id: string; widthCm: number; heightCm: number; priceMAD: number }[]
}

// Small rectangle with the format's real proportions
function FormatShape({ w, h, active }: { w: number; h: number; active: boolean }) {
  const scale = 22 / Math.max(w, h)
  return (
    <span aria-hidden="true" className="inline-flex size-6 items-center justify-center shrink-0">
      <span
        className={cn('block border', active ? 'border-grenat bg-grenat/15' : 'border-encre/40')}
        style={{ width: Math.max(6, w * scale), height: Math.max(6, h * scale) }}
      />
    </span>
  )
}

export function PurchasePanel({ paintingId, title, kind, available, priceMAD, widthCm, heightCm, leadTimeWeeks, options }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [added, setAdded] = useState(false)
  const isUnique = kind === 'UNIQUE'

  // The painting's own size is the default format; recreation options add more sizes
  const formats: FormatOption[] = [
    { key: 'original', widthCm, heightCm, priceMAD, isOriginal: true },
    ...options
      .filter(o => !(o.widthCm === widthCm && o.heightCm === heightCm))
      .map(o => ({ key: o.id, widthCm: o.widthCm, heightCm: o.heightCm, priceMAD: o.priceMAD, isOriginal: false })),
  ]
  const [selectedKey, setSelectedKey] = useState('original')
  const [quantity, setQuantity] = useState(1)
  const selected = formats.find(f => f.key === selectedKey) ?? formats[0]

  function addToCart(thenGoToCart: boolean) {
    startTransition(async () => {
      try {
        const body = {
          paintingId,
          quantity: isUnique ? 1 : quantity,
          ...(selected.isOriginal ? {} : { widthCm: selected.widthCm, heightCm: selected.heightCm }),
        }
        const res = await fetch('/api/cart-add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const json = await res.json().catch(() => null)
        if (json?.ok) {
          window.dispatchEvent(new Event('cart:changed'))
          setAdded(true)
          if (thenGoToCart) router.push('/cart')
          else toast.success(`« ${title} » ajouté au panier`, { action: { label: 'Voir le panier', onClick: () => router.push('/cart') } })
        } else if (json?.error === 'UNAVAILABLE') {
          toast.error("Cette œuvre vient d'être vendue")
          router.refresh()
        } else {
          toast.error("Impossible d'ajouter au panier")
        }
      } catch {
        toast.error('Erreur réseau, réessayez')
      }
    })
  }

  if (!available) {
    return (
      <div className="border-y border-trait py-8 space-y-4">
        <p className="font-display text-3xl text-encre">{isUnique ? 'Vendue' : 'Indisponible'}</p>
        <p className="text-[15px] leading-relaxed text-encre/80">
          {isUnique
            ? "Cette pièce unique a trouvé preneur. L'atelier peut réaliser une œuvre dans le même esprit, sur demande."
            : "Cette œuvre n'est pas disponible pour le moment."}
        </p>
        <Link href={`/contact?subject=${encodeURIComponent(`Demande autour de « ${title} »`)}`} className="btn-primaire w-full">
          Écrire à l&apos;atelier
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4 border-t border-trait pt-6">
        <p className="font-display text-4xl text-encre tabular">{formatMAD(selected.priceMAD)}</p>
        <p className="text-[13px] text-pierre text-right">Livraison offerte au Maroc</p>
      </div>

      {!isUnique && formats.length > 1 && (
        <fieldset>
          <legend className="eyebrow mb-3">Format</legend>
          <div className="divide-y divide-trait border-y border-trait">
            {formats.map(f => {
              const active = f.key === selectedKey
              return (
                <label key={f.key} className={cn('flex items-center justify-between gap-4 py-3 cursor-pointer text-[15px] transition-colors has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-grenat has-[input:focus-visible]:outline-offset-2', active ? 'text-encre' : 'text-encre/70 hover:text-encre')}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="format" value={f.key} checked={active} onChange={() => setSelectedKey(f.key)} className="sr-only peer" />
                    <FormatShape w={f.widthCm} h={f.heightCm} active={active} />
                    <span className={cn('tabular', active && 'font-medium')}>{formatDimensions(f.widthCm, f.heightCm)}</span>
                    {f.isOriginal && <span className="text-[11px] uppercase tracking-[0.12em] text-pierre">format original</span>}
                  </span>
                  <span className="tabular">{formatMAD(f.priceMAD)}</span>
                </label>
              )
            })}
          </div>
        </fieldset>
      )}

      {!isUnique && (
        <div className="flex items-center justify-between gap-3">
          <span className="eyebrow">Quantité</span>
          <div className="inline-flex items-center border border-trait">
            <button type="button" aria-label="Diminuer la quantité" disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))} className="size-10 text-encre hover:bg-voile disabled:opacity-30">−</button>
            <span className="w-8 text-center text-sm tabular" aria-live="polite">{quantity}</span>
            <button type="button" aria-label="Augmenter la quantité" disabled={quantity >= 20} onClick={() => setQuantity(q => Math.min(20, q + 1))} className="size-10 text-encre hover:bg-voile disabled:opacity-30">+</button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        <button type="button" onClick={() => addToCart(true)} disabled={isPending} className="btn-primaire h-12 w-full text-[15px]">
          {isUnique ? 'Réserver cette œuvre' : 'Commander'}
        </button>
        <button type="button" onClick={() => addToCart(false)} disabled={isPending} className="btn-secondaire w-full">
          {added ? 'Ajouter encore' : 'Ajouter au panier'}
        </button>
      </div>

      <ul className="space-y-2 text-[14px] text-encre/80">
        {isUnique ? (
          <li>Œuvre originale : il n&apos;en existe qu&apos;un exemplaire.</li>
        ) : (
          <li>Peinte à la main d&apos;après l&apos;original{leadTimeWeeks ? `, en ${leadTimeWeeks}${/^\d+$/.test(leadTimeWeeks.trim()) ? ' semaines' : ''}` : ''}.</li>
        )}
        <li>Emballage renforcé, suivi de commande par email.</li>
        <li>
          <Link href={`/contact?subject=${encodeURIComponent(`Question sur « ${title} »`)}`} className="lien">Poser une question sur cette œuvre</Link>
        </li>
      </ul>

      <ScaleDrawing widthCm={selected.widthCm} heightCm={selected.heightCm} className="border-t border-trait pt-6" />
    </div>
  )
}
