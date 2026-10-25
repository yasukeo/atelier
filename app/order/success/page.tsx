import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatDimensions, formatMAD } from '@/lib/format'
import { Khatam } from '@/components/Khatam'

export const metadata: Metadata = {
  title: 'Commande confirmée',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const resolvedParams = await searchParams
  const id = resolvedParams.id
  if (!id) notFound()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) notFound()
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
  if (!user) notFound()
  const order = await prisma.order.findFirst({ where: { id, customerId: user.id }, include: { items: { include: { painting: true } }, discountCode: true } })
  if (!order) notFound()

  const discountPercent = order.discountCode?.percent ?? undefined
  const subtotal = order.items.reduce((s, i) => s + i.unitPriceMAD * i.quantity, 0)
  const discountAmount = Math.max(0, subtotal + order.shippingFeeMAD - order.totalMAD)

  const NEXT_STEPS = [
    "L'atelier vérifie la commande et vous contacte, par téléphone ou par email.",
    'Une avance peut être demandée pour une re-création avant le début de la réalisation.',
    "Vous recevez un email à chaque étape, jusqu'à la livraison.",
  ]

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-24">
      <Khatam className="size-12 text-grenat" />
      <p className="mt-8 eyebrow">Commande n° {order.id.slice(-8).toUpperCase()}</p>
      <h1 className="mt-3 font-display text-5xl sm:text-6xl leading-[1.02] text-encre">Merci, votre commande est enregistrée.</h1>
      <p className="mt-5 text-[15px] leading-relaxed text-encre/80 max-w-xl">
        Un email de confirmation vient de vous être envoyé. Voici la suite :
      </p>
      <ol className="mt-6 space-y-3 text-[15px] leading-relaxed text-encre/85">
        {NEXT_STEPS.map((step, i) => (
          <li key={step} className="flex gap-4"><span className="font-display text-xl leading-6 text-grenat tabular">{i + 1}</span><span>{step}</span></li>
        ))}
      </ol>

      <section className="mt-14 border-t-2 border-encre pt-6" aria-labelledby="recap">
        <h2 id="recap" className="eyebrow">Récapitulatif</h2>
        <ul className="mt-4 divide-y divide-trait border-b border-trait">
          {order.items.map(it => (
            <li key={it.id} className="flex justify-between items-start gap-4 py-4 text-[15px]">
              <div className="min-w-0">
                <Link href={`/paintings/${it.paintingId}`} className="block font-display text-lg leading-snug text-encre truncate hover:text-grenat">{it.painting.title}</Link>
                <p className="text-[13px] text-pierre tabular">
                  {it.widthCm && it.heightCm ? formatDimensions(it.widthCm, it.heightCm) : ''}
                  {it.quantity > 1 ? ` · ${it.quantity} exemplaires` : ''}
                </p>
              </div>
              <span className="shrink-0 tabular">{formatMAD(it.unitPriceMAD * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 text-[15px]">
          <div className="flex justify-between"><dt className="text-pierre">Sous-total</dt><dd className="tabular">{formatMAD(subtotal)}</dd></div>
          {discountPercent && (
            <div className="flex justify-between text-emerald-800"><dt>Réduction ({discountPercent} %)</dt><dd className="tabular">−{formatMAD(discountAmount)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-pierre">Livraison</dt><dd>Gratuite</dd></div>
          <div className="flex justify-between items-baseline border-t border-trait pt-3"><dt className="font-medium">Total</dt><dd className="font-display text-3xl tabular">{formatMAD(order.totalMAD)}</dd></div>
        </dl>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/orders" className="btn-primaire">Suivre ma commande</Link>
        <Link href="/paintings" className="btn-secondaire">Retour à la galerie</Link>
      </div>
    </div>
  )
}
