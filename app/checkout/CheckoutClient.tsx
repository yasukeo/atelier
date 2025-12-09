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
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Formulaire de livraison */}
          <div className="order-2 lg:order-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#6B2D2D] mb-6">Informations de livraison</h1>
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
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Nom complet</label>
                <Input name="name" required minLength={2} className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]" />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Email</label>
                <Input type="email" name="email" required className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Téléphone</label>
                <Input name="phone" required className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]" />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone[0]}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Adresse</label>
                <Input name="address" required className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]" />
                {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address[0]}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Ville</label>
                  <Input name="city" required className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]" />
                  {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D2A26] mb-1.5">Code postal</label>
                  <Input name="postalCode" required className="h-11 border-[#D8D5C8] focus:border-[#6B2D2D] focus:ring-[#6B2D2D]" />
                  {errors.postalCode && <p className="text-sm text-red-600 mt-1">{errors.postalCode[0]}</p>}
                </div>
              </div>
              {/* Hidden discount field for server action alignment */}
              <input type="hidden" name="discountCode" value={discountStatus === 'valid' ? discountCode.toUpperCase() : ''} />
              
              {/* Note sur les avances */}
              <div className="bg-[#E9E7DB]/50 border border-[#D8D5C8] rounded-lg p-4 text-sm text-[#8B7355]">
                <p className="flex items-start gap-2">
                  <span className="text-[#6B2D2D] shrink-0">ℹ️</span>
                  <span>
                    Certaines œuvres, notamment les re-créations ou commandes personnalisées, peuvent nécessiter une avance avant le début de la réalisation. Vous serez contacté(e) pour convenir des modalités.
                  </span>
                </p>
              </div>

              <Button 
                disabled={isPlacing} 
                className="w-full h-12 text-base font-medium bg-[#6B2D2D] hover:bg-[#5A2525] text-white rounded-lg mt-2" 
                type="submit"
              >
                {isPlacing ? 'Traitement...' : 'Passer la commande'}
              </Button>
            </form>
          </div>

          {/* Récapitulatif */}
          <div className="order-1 lg:order-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#6B2D2D] mb-6">Récapitulatif</h2>
            <Card className="mb-6 border-[#D8D5C8] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#2D2A26]">Articles ({summary.items.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.items.map(item => (
                  <div key={item.key} className="flex justify-between text-sm gap-2">
                    <span className="text-[#2D2A26] flex-1 min-w-0">
                      <span className="block truncate">{item.title}</span>
                      {item.widthCm && item.heightCm && (
                        <span className="text-xs text-[#8B7355]">{item.widthCm}×{item.heightCm}cm × {item.quantity}</span>
                      )}
                    </span>
                    <span className="font-medium text-[#6B2D2D] shrink-0">{formatMAD(item.lineTotalMAD)}</span>
                  </div>
                ))}
                <div className="border-t border-[#E9E7DB] pt-3 mt-3 space-y-2">
                  <div className="text-sm flex justify-between text-[#8B7355]">
                    <span>Sous-total</span>
                    <span>{formatMAD(summary.subtotalMAD)}</span>
                  </div>
                  {summary.discountPercent && (
                    <div className="text-sm flex justify-between text-green-600">
                      <span>Réduction ({summary.discountPercent}%)</span>
                      <span>-{formatMAD(summary.discountAmountMAD || 0)}</span>
                    </div>
                  )}
                  <div className="text-sm flex justify-between text-[#8B7355]">
                    <span>Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                </div>
                <div className="border-t border-[#D8D5C8] pt-3 font-semibold flex justify-between text-[#2D2A26]">
                  <span>Total</span>
                  <span className="text-lg text-[#6B2D2D]">{formatMAD(summary.totalMAD)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#D8D5C8] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#2D2A26]">Code promo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input 
                    placeholder="CODE" 
                    value={discountCode} 
                    onChange={e => setDiscountCode(e.target.value)} 
                    className="uppercase h-10 border-[#D8D5C8] flex-1" 
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    disabled={!discountCode.trim() || discountStatus==='checking'} 
                    onClick={applyDiscount}
                    className="h-10 px-4 shrink-0"
                  >
                    Appliquer
                  </Button>
                </div>
                {discountStatus === 'valid' && <p className="text-xs text-green-600 mt-2">✓ Code appliqué</p>}
                {discountStatus === 'invalid' && <p className="text-xs text-red-600 mt-2">Code invalide</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
