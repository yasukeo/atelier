import { NextResponse } from 'next/server'
import { addToCart } from '@/lib/cart'

export async function POST(req: Request) {
  const data = await req.json().catch(() => null)
  const result = await addToCart(data)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
