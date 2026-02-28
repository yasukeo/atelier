import { getCart } from '@/lib/cart'
import CartClient from './CartClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panier',
  description: 'Votre panier Elwarcha.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const summary = await getCart()
  return <CartClient initialSummary={summary} />
}
