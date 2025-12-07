import { getCart } from '@/lib/cart'
import CartClient from './CartClient'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const summary = await getCart()
  return <CartClient initialSummary={summary} />
}
