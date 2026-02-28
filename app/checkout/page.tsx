import { getCart } from '@/lib/cart'
import CheckoutClient from './CheckoutClient'
import { redirect } from 'next/navigation'
import { validateDiscount } from '@/lib/discounts'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Paiement',
  description: 'Finalisez votre commande Elwarcha.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams
  const discountParamRaw = typeof resolvedParams.discount === 'string' ? resolvedParams.discount.trim() : undefined
  let summary
  let initialDiscountCode: string | undefined
  if (discountParamRaw) {
    const validation = await validateDiscount(discountParamRaw)
    if (validation.valid && validation.percent) {
      summary = await getCart(validation.percent)
      initialDiscountCode = discountParamRaw.toUpperCase()
    } else {
      summary = await getCart()
    }
  } else {
    summary = await getCart()
  }
  if (!summary.items.length) redirect('/cart')
  return <CheckoutClient initialSummary={summary} initialDiscountCode={initialDiscountCode} />
}
