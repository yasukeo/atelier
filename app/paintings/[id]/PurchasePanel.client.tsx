"use client"
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDimensions, formatMAD } from '@/lib/format'

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
      <div className="rounded-xl border border-[#DCD9CC] bg-[#FDFCFA] p-5 space-y-3">
        <p className="text-2xl font-semibold text-[#6B2D2D]">{isUnique ? 'Vendu' : 'Indisponible'}</p>
        <p className="text-sm text-[#8B7355]">
          {isUnique
            ? "Cette pièce unique a trouvé preneur. Nous pouvons réaliser une œuvre dans le même esprit, sur demande."
            : "Cette œuvre n'est pas disponible pour le moment."}
        </p>
        <Button asChild className="w-full h-11 rounded-full bg-[#6B2D2D] hover:bg-[#5A2525]">
          <Link href={`/contact?subject=${encodeURIComponent(`Demande autour de « ${title} »`)}`}>Nous contacter</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[#DCD9CC] bg-[#FDFCFA] p-5 space-y-5">
      <div>
        <p className="text-3xl font-semibold text-[#6B2D2D] tabular-nums">{formatMAD(selected.priceMAD)}</p>
        <p className="mt-1 text-xs text-[#8B7355]">Livraison offerte au Maroc</p>
      </div>

      {!isUnique && formats.length > 1 && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-[#2D2A26] mb-2">Format</legend>
          <div className="grid gap-2">
            {formats.map(f => (
              <label
                key={f.key}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition text-sm',
                  f.key === selectedKey ? 'border-[#6B2D2D] bg-[#6B2D2D]/5 ring-1 ring-[#6B2D2D]' : 'border-[#D8D5C8] hover:border-[#8B7355]'
                )}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" name="format" value={f.key} checked={f.key === selectedKey} onChange={() => setSelectedKey(f.key)} className="accent-[#6B2D2D]" />
                  <span className="text-[#2D2A26]">{formatDimensions(f.widthCm, f.heightCm)}</span>
                  {f.isOriginal && <span className="text-[10px] uppercase tracking-wide text-[#8B7355]">Format original</span>}
                </span>
                <span className="font-medium text-[#6B2D2D] tabular-nums">{formatMAD(f.priceMAD)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!isUnique && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#2D2A26]">Quantité</span>
          <div className="inline-flex items-center rounded-full border border-[#D8D5C8] bg-white">
            <button type="button" aria-label="Diminuer la quantité" disabled={quantity <= 1} onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-9 h-9 text-[#6B2D2D] disabled:opacity-30">−</button>
            <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{quantity}</span>
            <button type="button" aria-label="Augmenter la quantité" disabled={quantity >= 20} onClick={() => setQuantity(q => Math.min(20, q + 1))} className="w-9 h-9 text-[#6B2D2D] disabled:opacity-30">+</button>
          </div>
        </div>
      )}

      <div className="grid gap-2">
        <Button onClick={() => addToCart(true)} disabled={isPending} className="w-full h-12 rounded-full bg-[#6B2D2D] hover:bg-[#5A2525] text-base">
          {isUnique ? 'Réserver cette œuvre' : 'Commander'}
        </Button>
        <Button onClick={() => addToCart(false)} disabled={isPending} variant="outline" className="w-full h-11 rounded-full border-[#D8D5C8] text-[#6B2D2D]">
          {added ? 'Ajouter encore' : 'Ajouter au panier'}
        </Button>
      </div>

      <ul className="space-y-1.5 text-xs text-[#8B7355]">
        {isUnique ? (
          <li>• Pièce unique : œuvre originale, un seul exemplaire.</li>
        ) : (
          <li>• Re-création peinte à la main d&apos;après l&apos;œuvre originale{leadTimeWeeks ? ` — délai ${leadTimeWeeks}` : ''}.</li>
        )}
        <li>• Emballage renforcé et suivi de commande par email.</li>
        <li>• <Link href={`/contact?subject=${encodeURIComponent(`Question sur « ${title} »`)}`} className="underline underline-offset-2 hover:text-[#6B2D2D]">Une question sur cette œuvre ?</Link></li>
      </ul>
    </div>
  )
}
