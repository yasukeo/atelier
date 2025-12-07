import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function formatMAD(v: number) { return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v) }

export default async function OrderSuccessPage({ searchParams }: { searchParams: Record<string,string|undefined> }) {
  const id = searchParams.id
  if (!id) notFound()
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) notFound()
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
  if (!user) notFound()
  const order = await prisma.order.findFirst({ where: { id, customerId: user.id }, include: { items: { include: { painting: true } }, discountCode: true } })
  if (!order) notFound()

  const discountPercent = order.discountCode?.percent ?? undefined
  const discountAmount = discountPercent ? Math.floor((order.totalMAD + (order.discountCode ? Math.floor((order.totalMAD * discountPercent) / (100 - discountPercent)) : 0) - order.totalMAD)) : 0 // fallback simple

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <h1 className="text-3xl font-semibold mb-2">Commande réussie</h1>
      <p className="text-muted-foreground mb-8">Merci pour votre achat. Référence: <span className="font-mono">{order.id}</span></p>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-medium mb-3">Articles</h2>
          <div className="space-y-2 text-sm">
            {order.items.map(it => (
              <div key={it.id} className="flex justify-between">
                <span>{it.painting.title} {it.widthCm && it.heightCm ? `(${it.widthCm}x${it.heightCm}cm)` : ''} × {it.quantity}</span>
                <span>{formatMAD(it.unitPriceMAD * it.quantity)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="text-sm space-y-1 border-t pt-4">
          <div className="flex justify-between"><span>Sous-total</span><span>{formatMAD(order.items.reduce((s,i)=> s + i.unitPriceMAD * i.quantity,0))}</span></div>
          {discountPercent && <div className="flex justify-between text-green-600"><span>Réduction ({discountPercent}%)</span><span>-{formatMAD(discountAmount)}</span></div>}
          <div className="flex justify-between"><span>Livraison</span><span>Gratuite</span></div>
          <div className="flex justify-between font-semibold border-t pt-2 text-base"><span>Total payé</span><span>{formatMAD(order.totalMAD)}</span></div>
        </section>
      </div>
    </div>
  )
}
