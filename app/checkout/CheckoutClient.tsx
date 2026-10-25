'use client'
import { useState, useTransition } from 'react'
import { placeOrderAction } from './actions.order'
import { validateDiscountCode } from './actions'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { CartSummary } from '@/lib/cart'
import { formatDimensions, formatMAD } from '@/lib/format'

interface CheckoutClientProps { initialSummary: CartSummary; initialDiscountCode?: string; defaultName?: string; defaultEmail?: string }

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string[]; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-encre mb-2">
        {label}{hint && <span className="font-normal text-pierre"> {hint}</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-[13px] text-destructive">{error[0]}</p>}
    </div>
  )
}

export default function CheckoutClient({ initialSummary, initialDiscountCode, defaultName, defaultEmail }: CheckoutClientProps) {
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

  // Ties each field to its error message for screen readers
  const a11y = (id: string, key: string) => ({
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `${id}-error` : undefined,
  })

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <p className="eyebrow">Commande</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-none text-encre">Livraison</h1>
      <div className="mt-12 grid gap-12 lg:gap-16 lg:grid-cols-[1fr_380px] items-start">
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
                  toast.error('Vérifiez les champs signalés')
                } else if (result.error === 'EMPTY_CART') {
                  toast.error('Votre panier est vide')
                  router.push('/cart')
                } else if (result.error === 'UNAVAILABLE') {
                  toast.error("Une œuvre de votre panier vient d'être vendue")
                  router.push('/cart')
                } else if (result.error === 'AUTH_REQUIRED') {
                  router.push('/signin?callbackUrl=%2Fcheckout')
                } else {
                  toast.error("La commande n'a pas pu être enregistrée. Réessayez.")
                }
              } else {
                toast.success('Commande enregistrée')
                router.replace(`/order/success?id=${result.orderId}`)
              }
            })
          }}
          className="order-2 lg:order-1 space-y-6 border-t border-trait pt-8"
        >
          <Field id="checkout-name" label="Nom complet" error={errors.name}>
            <Input id="checkout-name" name="name" autoComplete="name" defaultValue={defaultName} required minLength={2} {...a11y('checkout-name', 'name')} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="checkout-email" label="Email" error={errors.email}>
              <Input type="email" id="checkout-email" name="email" autoComplete="email" defaultValue={defaultEmail} required {...a11y('checkout-email', 'email')} />
            </Field>
            <Field id="checkout-phone" label="Téléphone" hint="(pour la livraison)" error={errors.phone}>
              <Input id="checkout-phone" name="phone" type="tel" autoComplete="tel" placeholder="06 12 34 56 78" required {...a11y('checkout-phone', 'phone')} />
            </Field>
          </div>
          <Field id="checkout-address" label="Adresse" error={errors.address}>
            <Input id="checkout-address" name="address" autoComplete="street-address" required {...a11y('checkout-address', 'address')} />
          </Field>
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id="checkout-city" label="Ville" error={errors.city}>
              <Input id="checkout-city" name="city" autoComplete="address-level2" required {...a11y('checkout-city', 'city')} />
            </Field>
            <Field id="checkout-postalCode" label="Code postal" error={errors.postalCode}>
              <Input id="checkout-postalCode" name="postalCode" autoComplete="postal-code" inputMode="numeric" required {...a11y('checkout-postalCode', 'postalCode')} />
            </Field>
          </div>
          {/* Hidden discount field for server action alignment */}
          <input type="hidden" name="discountCode" value={discountStatus === 'valid' ? discountCode.toUpperCase() : ''} />

          <p className="border-l-2 border-safran bg-safran/5 px-4 py-3 text-[14px] leading-relaxed text-encre/85">
            Certaines œuvres, notamment les re-créations, peuvent nécessiter une avance avant le début de la réalisation. L&apos;atelier vous contacte pour convenir des modalités.
          </p>

          <button disabled={isPlacing} className="btn-primaire w-full h-12 text-[15px]" type="submit">
            {isPlacing ? 'Enregistrement…' : 'Confirmer la commande'}
          </button>
        </form>

        <aside className="order-1 lg:order-2 lg:sticky lg:top-24 border-t-2 border-encre pt-6 space-y-6">
          <h2 className="eyebrow">Votre commande</h2>
          <ul className="space-y-3">
            {summary.items.map(item => (
              <li key={item.key} className="flex justify-between gap-4 text-[15px]">
                <span className="min-w-0">
                  <span className="block font-display text-lg leading-snug truncate">{item.title}</span>
                  <span className="text-[13px] text-pierre tabular">
                    {item.widthCm && item.heightCm ? formatDimensions(item.widthCm, item.heightCm) : null}
                    {item.quantity > 1 ? ` · ${item.quantity} exemplaires` : ''}
                  </span>
                </span>
                <span className="shrink-0 tabular">{formatMAD(item.lineTotalMAD)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-3 border-t border-trait pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-pierre">Sous-total</dt><dd className="tabular">{formatMAD(summary.subtotalMAD)}</dd></div>
            {summary.discountPercent && (
              <div className="flex justify-between text-emerald-800"><dt>Réduction ({summary.discountPercent} %)</dt><dd className="tabular">−{formatMAD(summary.discountAmountMAD || 0)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-pierre">Livraison</dt><dd>Gratuite</dd></div>
            <div className="flex justify-between items-baseline border-t border-trait pt-4"><dt className="font-medium">Total</dt><dd className="font-display text-3xl tabular">{formatMAD(summary.totalMAD)}</dd></div>
          </dl>
          <div className="space-y-2">
            <label htmlFor="checkout-discount" className="block text-[13px] font-medium text-encre">Code promo</label>
            <div className="flex gap-2">
              <Input id="checkout-discount" value={discountCode} onChange={e => setDiscountCode(e.target.value)} className="uppercase" />
              <button type="button" disabled={!discountCode.trim() || discountStatus === 'checking'} onClick={applyDiscount} className="btn-secondaire h-10 px-4 shrink-0">
                Appliquer
              </button>
            </div>
            {discountStatus === 'valid' && <p className="text-[13px] text-emerald-800" role="status">Code appliqué</p>}
            {discountStatus === 'invalid' && <p className="text-[13px] text-destructive" role="alert">Ce code n&apos;est pas valide ou a expiré.</p>}
          </div>
        </aside>
      </div>
    </div>
  )
}
