'use client'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { removeCartItemAction, updateCartItemAction, applyDiscountAction } from './actions'
import Link from 'next/link'
import type { CartSummary } from '@/lib/cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props { initialSummary: CartSummary }

export default function CartClient({ initialSummary }: Props) {
  const [summary, setSummary] = useState(initialSummary)
  const [pending, start] = useTransition()
  const [discountCode, setDiscountCode] = useState('')
  const [discountResult, setDiscountResult] = useState<{status: 'idle'|'checking'|'applied'|'error'; message?: string}>({status:'idle'})


  async function onQuantityChange(key: string, quantity: number) {
    start(async () => {
      const updated = await updateCartItemAction({ key, quantity, discountPercent: summary.discountPercent })
      setSummary(updated)
    })
  }

  async function onRemove(key: string) {
    start(async () => {
      const updated = await removeCartItemAction({ key, discountPercent: summary.discountPercent })
      setSummary(updated)
    })
  }

  async function applyDiscount() {
    setDiscountResult({status:'checking'})
    const res = await applyDiscountAction({ code: discountCode })
    if (!res.ok) {
      setDiscountResult({status:'error', message:'Invalide'})
      return
    }
    setSummary(res.summary)
    setDiscountResult({status:'applied', message:`-${res.percent}%`})
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Panier</h1>
      {summary.items.length === 0 && <p>Votre panier est vide.</p>}
      {summary.items.length > 0 && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {summary.items.map((item) => (
              <Card key={item.key} className="overflow-hidden">
                <CardContent className="p-4 flex gap-4">
                  {item.imageUrl && (
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image src={item.imageUrl} alt={item.title} fill className="object-cover rounded" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{item.title}</div>
                    {(item.widthCm && item.heightCm) && <div className="text-sm text-muted-foreground">{item.widthCm} x {item.heightCm} cm</div>}
                    <div className="text-sm">Prix unitaire: {item.unitPriceMAD} MAD</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Input type="number" min={1} max={20} className="w-20" value={item.quantity} disabled={pending} onChange={e => onQuantityChange(item.key, Number(e.target.value))} />
                      <Button variant="destructive" size="sm" disabled={pending} onClick={() => onRemove(item.key)}>Retirer</Button>
                    </div>
                  </div>
                  <div className="text-right font-semibold">{item.lineTotalMAD} MAD</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span>Sous-total</span><span>{summary.subtotalMAD} MAD</span></div>
                {summary.discountAmountMAD !== undefined && (
                  <div className="flex justify-between text-sm text-green-600"><span>Réduction ({summary.discountPercent}%)</span><span>-{summary.discountAmountMAD} MAD</span></div>
                )}
                <hr className="my-2 border-t border-border" />
                <div className="flex justify-between font-semibold"><span>Total</span><span>{summary.totalMAD} MAD</span></div>
                <div className="pt-4 space-y-2">
                  <div className="flex gap-2">
                    <Input placeholder="Code promo" value={discountCode} onChange={e=>setDiscountCode(e.target.value)} />
                    <Button type="button" onClick={applyDiscount} disabled={!discountCode || pending}>Appliquer</Button>
                  </div>
                  {discountResult.status === 'checking' && <p className="text-xs text-muted-foreground">Vérification…</p>}
                  {discountResult.status === 'applied' && <p className="text-xs text-green-600">Réduction appliquée {discountResult.message}</p>}
                  {discountResult.status === 'error' && <p className="text-xs text-red-600">{discountResult.message}</p>}
                </div>
                <Button className="w-full mt-4" disabled={summary.items.length === 0 || pending} asChild>
                  <Link href={summary.discountPercent !== undefined && discountResult.status==='applied' && discountCode ? `/checkout?discount=${encodeURIComponent(discountCode.trim())}` : '/checkout'}>
                    Passer au paiement
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
