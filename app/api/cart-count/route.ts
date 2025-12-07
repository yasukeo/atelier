import { NextResponse } from 'next/server'
import { getCart } from '@/lib/cart'

export async function GET() {
  const summary = await getCart()
  return NextResponse.json({ count: summary.items.reduce((s,i)=> s + i.quantity, 0) })
}
