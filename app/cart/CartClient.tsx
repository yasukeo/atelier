'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { removeCartItemAction, updateCartItemAction, applyDiscountAction } from './actions'
import Link from 'next/link'
import type { CartSummary } from '@/lib/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDimensions, formatMAD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { t } from '@/lib/i18n'

interface Props { initialSummary: CartSummary }

export default function CartClient({ initialSummary }: Props) {
  const [summary, setSummary] = useState(initialSummary)
  const [pending, start] = useTransition()
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState<{status: 'idle'|'checking'|'applied'|'error'; message?: string}>({status:'idle'})

  function notifyCartChanged() {
    window.dispatchEvent(new Event('cart:changed'))
  }

  function onQuantityChange(key: string, quantity: number) {
    if (quantity < 1 || quantity > 20) return
    start(async () => {
      const updated = await updateCartItemAction({ key, quantity, discountPercent: summary.discountPercent })
      setSummary(updated)
      notifyCartChanged()
    })
  }

  function onRemove(key: string) {
    start(async () => {
      const updated = await removeCartItemAction({ key, discountPercent: summary.discountPercent })
      setSummary(updated)
      notifyCartChanged()
    })
  }

  async function applyDiscount() {
    setDiscountResult({status:'checking'})
    const res = await applyDiscountAction({ code: discountCode })
    if (!res.ok) {
      setDiscountResult({status:'error', message:'Code promo invalide ou expiré'})
      return
    }
    setSummary(res.summary)
    setDiscountResult({status:'applied', message:`-${res.percent}%`})
  }

  const itemCount = summary.items.filter(i => i.available).reduce((s, i) => s + i.quantity, 0)
  const checkoutHref = summary.discountPercent !== undefined && discountResult.status === 'applied' && discountCode
    ? `/checkout?discount=${encodeURIComponent(discountCode.trim())}`
    : '/checkout'

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#6B2D2D]">Panier</h1>

      {summary.items.length === 0 ? (
        <section className="text-center py-16 space-y-5">
          <p className="text-[#8B7355]">Votre panier est vide.</p>
          <Link href="/paintings" className="inline-flex items-center justify-center rounded-full bg-[#6B2D2D] text-white px-6 h-11 text-sm font-medium hover:bg-[#5A2525] transition">
            Découvrir la galerie
          </Link>
        </section>
      ) : (
        <div className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-4" aria-busy={pending}>
            {summary.items.map((item) => (
              <li key={item.key} className={cn('rounded-xl border border-[#DCD9CC] bg-[#FDFCFA] p-3 sm:p-4 flex gap-3 sm:gap-4', !item.available && 'opacity-70')}>
                <Link href={`/paintings/${item.paintingId}`} className="relative w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-lg overflow-hidden bg-[#EAE8DE]">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill sizes="96px" className="object-cover" />}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/paintings/${item.paintingId}`} className="font-medium text-[#2D2A26] hover:text-[#6B2D2D] line-clamp-2">{item.title}</Link>
                      {item.widthCm && item.heightCm && (
                        <p className="text-xs text-[#8B7355] mt-0.5">Format {formatDimensions(item.widthCm, item.heightCm)}</p>
                      )}
                      <p className="text-xs text-[#8B7355] mt-0.5">{formatMAD(item.unitPriceMAD)} / pièce</p>
                    </div>
                    <p className="font-semibold text-[#6B2D2D] whitespace-nowrap">{formatMAD(item.lineTotalMAD)}</p>
                  </div>
                  {!item.available && (
                    <p className="mt-2 text-xs font-medium text-red-700">Cette œuvre n&apos;est plus disponible. Retirez-la pour continuer.</p>
                  )}
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    {item.available && item.isUnique ? (
                      <span className="text-[10px] uppercase tracking-wide text-[#8B7355]">Pièce unique</span>
                    ) : item.available ? (
                      <div className="inline-flex items-center rounded-full border border-[#D8D5C8] bg-white">
                        <button type="button" aria-label="Diminuer la quantité" disabled={pending || item.quantity <= 1} onClick={() => onQuantityChange(item.key, item.quantity - 1)} className="w-8 h-8 text-[#6B2D2D] disabled:opacity-30">−</button>
                        <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{item.quantity}</span>
                        <button type="button" aria-label="Augmenter la quantité" disabled={pending || item.quantity >= 20} onClick={() => onQuantityChange(item.key, item.quantity + 1)} className="w-8 h-8 text-[#6B2D2D] disabled:opacity-30">+</button>
                      </div>
                    ) : <span />}
                    <button type="button" disabled={pending} onClick={() => onRemove(item.key)} className="text-xs text-[#8B7355] hover:text-red-700 underline-offset-2 hover:underline disabled:opacity-50">
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-20 h-max rounded-xl border border-[#DCD9CC] bg-white p-5 space-y-3 shadow-sm">
            <h2 className="font-semibold text-[#2D2A26]">Résumé</h2>
            <div className="flex justify-between text-sm text-[#8B7355]"><span>Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span><span>{formatMAD(summary.subtotalMAD)}</span></div>
            {summary.discountAmountMAD !== undefined && (
              <div className="flex justify-between text-sm text-green-700"><span>Réduction ({summary.discountPercent}%)</span><span>-{formatMAD(summary.discountAmountMAD)}</span></div>
            )}
            <div className="flex justify-between text-sm text-[#8B7355]"><span>Livraison</span><span className="text-green-700">Gratuite</span></div>
            <div className="flex justify-between font-semibold text-[#2D2A26] border-t border-[#E9E7DB] pt-3"><span>Total</span><span className="text-lg text-[#6B2D2D]">{formatMAD(summary.totalMAD)}</span></div>
            <div className="pt-2 space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Code promo" aria-label="Code promo" value={discountCode} onChange={e=>setDiscountCode(e.target.value)} className="uppercase h-10" />
                <Button type="button" variant="secondary" className="h-10" onClick={applyDiscount} disabled={!discountCode.trim() || pending || discountResult.status === 'checking'}>Appliquer</Button>
              </div>
              {discountResult.status === 'checking' && <p className="text-xs text-[#8B7355]">Vérification…</p>}
              {discountResult.status === 'applied' && <p className="text-xs text-green-700">Réduction appliquée {discountResult.message}</p>}
              {discountResult.status === 'error' && <p className="text-xs text-red-700">{discountResult.message}</p>}
            </div>
            {summary.hasUnavailable ? (
              <Button className="w-full h-11 rounded-full" disabled>Retirez les œuvres indisponibles</Button>
            ) : (
              <Button className="w-full h-11 rounded-full bg-[#6B2D2D] hover:bg-[#5A2525]" disabled={pending} asChild>
                <Link href={checkoutHref}>Passer la commande</Link>
              </Button>
            )}
            <p className="text-[11px] text-[#8B7355] leading-relaxed">{t('home.advancePayment.shortText')}</p>
            <Link href="/paintings" className="block text-center text-xs text-[#8B7355] hover:text-[#6B2D2D] hover:underline">← Continuer mes achats</Link>
          </aside>
        </div>
      )}
    </div>
  )
}
