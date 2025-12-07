'use client'
import { useState, useTransition } from 'react'
import { placeOrderAction } from './actions.order'
import { validateDiscountCode } from './actions'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface CartLine { key: string; paintingId: string; title: string; imageUrl: string | null; widthCm?: number; heightCm?: number; unitPriceMAD: number; quantity: number; lineTotalMAD: number }
interface CartSummary { items: CartLine[]; subtotalMAD: number; discountPercent?: number; discountAmountMAD?: number; totalMAD: number }

interface CheckoutClientProps { initialSummary: CartSummary; initialDiscountCode?: string }

export default function CheckoutClient({ initialSummary, initialDiscountCode }: CheckoutClientProps) {
  const [summary, setSummary] = useState<CartSummary>(initialSummary)
  const [discountCode, setDiscountCode] = useState(initialDiscountCode || '')
  const [discountStatus, setDiscountStatus] = useState<'idle'|'valid'|'invalid'|'checking'>(initialDiscountCode && initialSummary.discountPercent ? 'valid' : 'idle')
  const [errors, setErrors] = useState<Record<string,string[]>>({})
  const [isPlacing, startPlacing] = useTransition()
  const router = useRouter()

  async function applyDiscount() {
    if (!discountCode.trim()) return
    setDiscountStatus('checking')
    const fd = new FormData()
    fd.set('code', discountCode.trim())
    const res = await validateDiscountCode(fd)
    if (res && 'valid' in res && res.valid && 'percent' in res && typeof res.percent === 'number') {
      const discountAmountMAD = Math.floor((summary.subtotalMAD * res.percent) / 100)
      setSummary({ ...summary, discountPercent: res.percent, discountAmountMAD, totalMAD: summary.subtotalMAD - discountAmountMAD })
      setDiscountStatus('valid')
      toast.success('Code appliqué')
    } else {
      setSummary({ ...summary, discountPercent: undefined, discountAmountMAD: undefined, totalMAD: summary.subtotalMAD })
      setDiscountStatus('invalid')
      toast.error('Code promo invalide')
    }
  }

  function formatMAD(v: number) { return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v) }

  return (
    <div className="container mx-auto max-w-5xl py-8 grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Informations de livraison</h1>
        <form
          action={async (formData: FormData) => {
            // Inject discount code if valid
            if (summary.discountPercent && discountCode) {
              formData.set('discountCode', discountCode.toUpperCase())
            }
            setErrors({})
            startPlacing(async () => {
              const result = await placeOrderAction(formData)
              if (!result.ok) {
                if (result.error === 'VALIDATION' && result.fieldErrors) {
                  setErrors(result.fieldErrors)
                  toast.error('Erreurs de validation')
                } else if (result.error === 'EMPTY_CART') {
                  toast.error('Panier vide')
                  router.push('/cart')
                } else if (result.error === 'AUTH_REQUIRED') {
                  router.push('/signin')
                } else {
                  toast.error('Erreur lors de la commande')
                }
              } else {
                toast.success('Commande créée')
                router.replace(`/order/success?id=${result.orderId}`)
              }
            })
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nom complet</label>
            <Input name="name" required minLength={2} />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" name="email" required />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email[0]}</p>}
          </div>
            <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <Input name="phone" required />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone[0]}</p>}</div>
          <div>
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <Input name="address" required />
            {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ville</label>
              <Input name="city" required />
              {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city[0]}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Code postal</label>
              <Input name="postalCode" required />
              {errors.postalCode && <p className="text-sm text-red-600 mt-1">{errors.postalCode[0]}</p>}
            </div>
          </div>
          {/* Hidden discount field for server action alignment */}
          <input type="hidden" name="discountCode" value={discountStatus === 'valid' ? discountCode.toUpperCase() : ''} />
          <Button disabled={isPlacing} className="w-full" type="submit">{isPlacing ? 'Traitement...' : 'Passer la commande'}</Button>
        </form>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Récapitulatif</h2>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Articles ({summary.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.items.map(item => (
              <div key={item.key} className="flex justify-between text-sm">
                <span>{item.title} {item.widthCm && item.heightCm ? `(${item.widthCm}x${item.heightCm}cm)` : ''} × {item.quantity}</span>
                <span>{formatMAD(item.lineTotalMAD)}</span>
              </div>
            ))}
            <div className="border-t pt-2 text-sm flex justify-between"><span>Sous-total</span><span>{formatMAD(summary.subtotalMAD)}</span></div>
            {summary.discountPercent && (
              <div className="text-sm flex justify-between text-green-600"><span>Réduction ({summary.discountPercent}%)</span><span>-{formatMAD(summary.discountAmountMAD || 0)}</span></div>
            )}
            <div className="text-sm flex justify-between"><span>Livraison</span><span>Gratuite</span></div>
            <div className="border-t pt-2 font-semibold flex justify-between"><span>Total</span><span>{formatMAD(summary.totalMAD)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Code promo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="CODE" value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="uppercase" />
              <Button type="button" variant="secondary" disabled={!discountCode.trim() || discountStatus==='checking'} onClick={applyDiscount}>Appliquer</Button>
            </div>
            {discountStatus === 'valid' && <p className="text-xs text-green-600 mt-1">Code appliqué</p>}
            {discountStatus === 'invalid' && <p className="text-xs text-red-600 mt-1">Code invalide</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
