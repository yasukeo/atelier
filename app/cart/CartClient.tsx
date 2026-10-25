'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { removeCartItemAction, updateCartItemAction, applyDiscountAction } from './actions'
import Link from 'next/link'
import type { CartSummary } from '@/lib/cart'
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
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <h1 className="font-display text-6xl leading-none text-encre">Panier</h1>

      {summary.items.length === 0 ? (
        <section className="mt-12 border-t border-trait pt-12 space-y-6">
          <p className="font-display text-2xl text-encre">Votre panier est vide.</p>
          <p className="text-[15px] text-pierre max-w-md">Les œuvres que vous réservez apparaissent ici, le temps de finaliser votre commande.</p>
          <Link href="/paintings" className="btn-primaire">Voir les œuvres</Link>
        </section>
      ) : (
        <div className="mt-12 grid gap-12 lg:gap-16 lg:grid-cols-[1fr_360px] items-start">
          <ul className="border-t border-trait divide-y divide-trait" aria-busy={pending}>
            {summary.items.map((item) => (
              <li key={item.key} className={cn('py-6 flex gap-5 sm:gap-6', !item.available && 'opacity-70')}>
                <Link href={`/paintings/${item.paintingId}`} className="relative w-24 h-30 sm:w-28 sm:h-36 shrink-0 overflow-hidden bg-voile">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill sizes="112px" className="object-cover" />}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <Link href={`/paintings/${item.paintingId}`} className="font-display text-xl leading-snug text-encre hover:text-grenat line-clamp-2">{item.title}</Link>
                      {item.widthCm && item.heightCm && (
                        <p className="text-[13px] text-pierre tabular">Format {formatDimensions(item.widthCm, item.heightCm)}</p>
                      )}
                      {!item.isUnique && <p className="text-[13px] text-pierre tabular">{formatMAD(item.unitPriceMAD)} l&apos;unité</p>}
                    </div>
                    <p className="text-[15px] font-medium text-encre whitespace-nowrap tabular">{formatMAD(item.lineTotalMAD)}</p>
                  </div>
                  {!item.available && (
                    <p role="alert" className="mt-3 text-[13px] font-medium text-destructive">Cette œuvre n&apos;est plus disponible. Retirez-la pour continuer.</p>
                  )}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    {item.available && item.isUnique ? (
                      <span className="eyebrow">Pièce unique</span>
                    ) : item.available ? (
                      <div className="inline-flex items-center border border-trait">
                        <button type="button" aria-label="Diminuer la quantité" disabled={pending || item.quantity <= 1} onClick={() => onQuantityChange(item.key, item.quantity - 1)} className="size-9 text-encre hover:bg-voile disabled:opacity-30">−</button>
                        <span className="w-8 text-center text-sm tabular" aria-live="polite">{item.quantity}</span>
                        <button type="button" aria-label="Augmenter la quantité" disabled={pending || item.quantity >= 20} onClick={() => onQuantityChange(item.key, item.quantity + 1)} className="size-9 text-encre hover:bg-voile disabled:opacity-30">+</button>
                      </div>
                    ) : <span />}
                    <button type="button" disabled={pending} onClick={() => onRemove(item.key)} className="text-[13px] text-pierre underline decoration-trait underline-offset-4 hover:text-destructive hover:decoration-destructive disabled:opacity-50">
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 border-t-2 border-encre pt-6 space-y-4">
            <h2 className="eyebrow">Récapitulatif</h2>
            <dl className="space-y-3 text-[15px]">
              <div className="flex justify-between"><dt className="text-pierre">Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</dt><dd className="tabular">{formatMAD(summary.subtotalMAD)}</dd></div>
              {summary.discountAmountMAD !== undefined && (
                <div className="flex justify-between text-emerald-800"><dt>Réduction ({summary.discountPercent} %)</dt><dd className="tabular">−{formatMAD(summary.discountAmountMAD)}</dd></div>
              )}
              <div className="flex justify-between"><dt className="text-pierre">Livraison</dt><dd>Gratuite</dd></div>
              <div className="flex justify-between items-baseline border-t border-trait pt-4"><dt className="font-medium">Total</dt><dd className="font-display text-3xl tabular">{formatMAD(summary.totalMAD)}</dd></div>
            </dl>
            <div className="pt-2 space-y-2">
              <div className="flex gap-2">
                <Input placeholder="Code promo" aria-label="Code promo" value={discountCode} onChange={e=>setDiscountCode(e.target.value)} className="uppercase" />
                <button type="button" className="btn-secondaire h-10 px-4" onClick={applyDiscount} disabled={!discountCode.trim() || pending || discountResult.status === 'checking'}>Appliquer</button>
              </div>
              {discountResult.status === 'checking' && <p className="text-[13px] text-pierre" role="status">Vérification…</p>}
              {discountResult.status === 'applied' && <p className="text-[13px] text-emerald-800" role="status">Réduction appliquée : {discountResult.message}</p>}
              {discountResult.status === 'error' && <p className="text-[13px] text-destructive" role="alert">{discountResult.message}</p>}
            </div>
            {summary.hasUnavailable ? (
              <button type="button" className="btn-primaire w-full h-12" disabled>Retirez les œuvres indisponibles</button>
            ) : (
              <Link href={checkoutHref} aria-disabled={pending} className={cn('btn-primaire w-full h-12', pending && 'pointer-events-none opacity-60')}>Passer la commande</Link>
            )}
            <p className="text-[13px] text-pierre leading-relaxed">{t('home.advancePayment.shortText')}</p>
            <Link href="/paintings" className="block text-[13px] text-pierre hover:text-encre">← Continuer mes achats</Link>
          </aside>
        </div>
      )}
    </div>
  )
}
