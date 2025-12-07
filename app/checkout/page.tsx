import { getCart } from '@/lib/cart'
import CheckoutClient from './CheckoutClient'
import { redirect } from 'next/navigation'
import { validateDiscount } from '@/lib/discounts'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ searchParams }: { searchParams: { [k: string]: string | string[] | undefined } }) {
  const discountParamRaw = typeof searchParams.discount === 'string' ? searchParams.discount.trim() : undefined
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
