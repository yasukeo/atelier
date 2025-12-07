import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mes commandes | Elwarcha',
  description: 'Consultez l\'historique de vos commandes et suivez leur statut.',
}

export const dynamic = 'force-dynamic'

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: 'En attente de validation',
  IN_PROGRESS: 'En cours de préparation',
  READY_FOR_DELIVERY: 'Prête pour livraison',
  COMPLETED: 'Livrée',
  CANCELED: 'Annulée',
}

const statusColors: Record<string, string> = {
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  READY_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
}

function formatMAD(v: number) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    redirect('/signin')
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
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight text-[#6B2D2D]">Mes commandes</h1>
        <Link href="/" className="text-sm text-[#8B7355] hover:text-[#6B2D2D] hover:underline">Accueil</Link>
      </div>

      {orders.length === 0 ? (
        <section className="text-center py-16 space-y-6">
          <div className="text-6xl">📦</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#2D2A26]">Aucune commande</h2>
            <p className="text-[#8B7355] max-w-md mx-auto">
              Vous n&apos;avez pas encore passé de commande. Découvrez notre galerie pour trouver l&apos;œuvre parfaite.
            </p>
          </div>
          <Link
            href="/paintings"
            className="inline-flex items-center justify-center rounded-full bg-[#6B2D2D] text-white px-6 h-10 text-sm font-medium hover:bg-[#5A2525] transition"
          >
            Découvrir la galerie
          </Link>
        </section>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-lg border border-[#DCD9CC] bg-[#FDFCFA] overflow-hidden"
            >
              {/* Order Header */}
              <header className="px-6 py-4 border-b border-[#DCD9CC] bg-[#F7F5F0] flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#2D2A26]">
                    Commande du {formatDate(order.createdAt)}
                  </p>
                  <p className="text-xs font-mono text-[#8B7355]">
                    Réf: {order.id}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-zinc-100 text-zinc-800'}`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </header>

              {/* Order Items */}
              <div className="divide-y">
                {order.items.map((item) => {
                  const img = item.painting.images.sort((a, b) => a.position - b.position)[0]
                  const displayWidth = item.widthCm || item.painting.widthCm
                  const displayHeight = item.heightCm || item.painting.heightCm
                  return (
                    <div key={item.id} className="px-6 py-4 flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-[#EAE8DE] overflow-hidden flex-shrink-0 border border-[#DCD9CC]">
                        {img ? (
                          <img
                            src={img.url}
                            alt={item.painting.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg text-[#8B7355]">
                            🖼️
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate text-[#2D2A26]">
                          {item.painting.title}
                        </h3>
                        <p className="text-xs text-[#8B7355] mt-1">
                          {displayWidth} × {displayHeight} cm • Qté: {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-[#2D2A26]">
                        {formatMAD(item.unitPriceMAD * item.quantity)}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Order Footer */}
              <footer className="px-6 py-4 border-t border-[#DCD9CC] bg-[#F7F5F0]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm space-y-1">
                    <p className="text-[#8B7355]">
                      <span className="font-medium text-[#2D2A26]">Livraison:</span>{' '}
                      {order.addressLine1}, {order.city} {order.postalCode}
                    </p>
                    <p className="text-[#8B7355]">
                      <span className="font-medium text-[#2D2A26]">Téléphone:</span>{' '}
                      {order.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    {order.discountCode && (
                      <p className="text-xs text-green-600">
                        Réduction: -{order.discountCode.percent}%
                      </p>
                    )}
                    <p className="text-lg font-semibold text-[#2D2A26]">
                      {formatMAD(order.totalMAD)}
                    </p>
                    {order.shippingFeeMAD > 0 ? (
                      <p className="text-xs text-[#8B7355]">
                        dont {formatMAD(order.shippingFeeMAD)} de livraison
                      </p>
                    ) : (
                      <p className="text-xs text-[#8B7355]">Livraison gratuite</p>
                    )}
                  </div>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
