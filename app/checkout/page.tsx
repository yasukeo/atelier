import { getCart } from '@/lib/cart'
import CheckoutClient from './CheckoutClient'
import { redirect } from 'next/navigation'
import { validateDiscount } from '@/lib/discounts'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Commande',
  description: 'Finalisez votre commande Elwarcha.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams
  const discountParamRaw = typeof resolvedParams.discount === 'string' ? resolvedParams.discount.trim() : undefined

  // Orders require an account: send guests to sign in first (their cart is merged on login)
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    const back = discountParamRaw ? `/checkout?discount=${encodeURIComponent(discountParamRaw)}` : '/checkout'
    redirect(`/signin?callbackUrl=${encodeURIComponent(back)}`)
  }

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
  if (!summary.items.length || summary.hasUnavailable) redirect('/cart')

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { name: true, email: true } })
  return (
    <CheckoutClient
      initialSummary={summary}
      initialDiscountCode={initialDiscountCode}
      defaultName={user?.name ?? ''}
      defaultEmail={user?.email ?? session.user.email}
    />
  )
}
