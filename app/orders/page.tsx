import { prisma } from '@/lib/db'
import { formatDimensions, formatMAD } from '@/lib/format'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Mes commandes',
  description: 'Consultez l\'historique de vos commandes et suivez leur statut.',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

// The order statuses, in the order an order goes through them
const STEPS = [
  { status: 'PENDING_REVIEW', label: 'En vérification' },
  { status: 'IN_PROGRESS', label: 'En préparation' },
  { status: 'READY_FOR_DELIVERY', label: 'Prête à livrer' },
  { status: 'COMPLETED', label: 'Livrée' },
] as const

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

function OrderProgress({ status }: { status: string }) {
  if (status === 'CANCELED') {
    return <p className="text-[13px] font-medium text-destructive">Commande annulée</p>
  }
  const current = STEPS.findIndex(s => s.status === status)
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Avancement de la commande">
      {STEPS.map((s, i) => {
        const done = i <= current
        return (
          <li key={s.status} aria-current={i === current ? 'step' : undefined} className="space-y-2">
            <span className={cn('block h-[3px]', done ? 'bg-grenat' : 'bg-trait')} />
            <span className={cn('block text-[12px] leading-tight', i === current ? 'font-medium text-encre' : done ? 'text-encre/70' : 'text-pierre/70')}>
              {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/signin?callbackUrl=%2Forders')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  })

  if (!user) {
    redirect('/signin')
  }

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      items: {
        include: {
          painting: {
            select: {
              id: true,
              title: true,
              widthCm: true,
              heightCm: true,
              images: true,
            },
          },
        },
      },
      discountCode: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-24">
      <h1 className="font-display text-5xl sm:text-6xl leading-none text-encre">Mes commandes</h1>

      {orders.length === 0 ? (
        <section className="mt-12 border-t border-trait pt-12 space-y-6">
          <p className="font-display text-2xl text-encre">Aucune commande pour le moment.</p>
          <p className="text-[15px] text-pierre max-w-md">Vos commandes et leur avancement apparaîtront ici dès votre première réservation.</p>
          <Link href="/paintings" className="btn-primaire">Voir les œuvres</Link>
        </section>
      ) : (
        <div className="mt-12 space-y-14">
          {orders.map((order) => (
            <article key={order.id} className="border-t-2 border-encre pt-6">
              <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <h2 className="font-display text-2xl text-encre">Commande du {formatDate(order.createdAt)}</h2>
                <p className="eyebrow">N° {order.id.slice(-8).toUpperCase()}</p>
              </header>

              <div className="mt-6 max-w-xl">
                <OrderProgress status={order.status} />
              </div>

              <ul className="mt-8 divide-y divide-trait border-y border-trait">
                {order.items.map((item) => {
                  const img = [...item.painting.images].sort((a, b) => a.position - b.position)[0]
                  const displayWidth = item.widthCm || item.painting.widthCm
                  const displayHeight = item.heightCm || item.painting.heightCm
                  return (
                    <li key={item.id} className="py-4 flex gap-4 items-center">
                      <div className="relative w-14 h-[4.5rem] shrink-0 overflow-hidden bg-voile">
                        {img && <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display text-lg leading-snug truncate text-encre">
                          <Link href={`/paintings/${item.painting.id}`} className="hover:text-grenat">{item.painting.title}</Link>
                        </h3>
                        <p className="text-[13px] text-pierre tabular">
                          {formatDimensions(displayWidth, displayHeight)}
                          {item.quantity > 1 ? ` · ${item.quantity} exemplaires` : ''}
                        </p>
                      </div>
                      <p className="text-[15px] tabular text-encre">{formatMAD(item.unitPriceMAD * item.quantity)}</p>
                    </li>
                  )
                })}
              </ul>

              <footer className="mt-4 flex flex-wrap items-start justify-between gap-6 text-[14px]">
                <dl className="space-y-1 text-pierre">
                  <div><dt className="inline text-encre">Livraison : </dt><dd className="inline">{order.addressLine1}, {order.city} {order.postalCode}</dd></div>
                  <div><dt className="inline text-encre">Téléphone : </dt><dd className="inline">{order.phone}</dd></div>
                </dl>
                <div className="text-right">
                  {order.discountCode && (
                    <p className="text-[13px] text-emerald-800">Réduction de {order.discountCode.percent} %</p>
                  )}
                  <p className="font-display text-2xl tabular text-encre">{formatMAD(order.totalMAD)}</p>
                  <p className="text-[13px] text-pierre">
                    {order.shippingFeeMAD > 0 ? `dont ${formatMAD(order.shippingFeeMAD)} de livraison` : 'Livraison gratuite'}
                  </p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
