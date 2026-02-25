import { prisma } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import { updateOrderStatusAction } from './actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const STATUS_LABEL: Record<string,string> = {
  PENDING_REVIEW: 'En attente de revue',
  IN_PROGRESS: 'En cours',
  READY_FOR_DELIVERY: 'Prête pour livraison',
  COMPLETED: 'Terminée',
  CANCELED: 'Annulée'
}

const STATUSES: { value: string; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'En attente de revue' },
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'READY_FOR_DELIVERY', label: 'Prête pour livraison' },
  { value: 'COMPLETED', label: 'Terminée' },
  { value: 'CANCELED', label: 'Annulée' },
]

function formatDate(d: Date) { return d.toLocaleString('fr-MA', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) }

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { customer: true, items: { include: { painting: true } }, discountCode: true, statusHistory: { orderBy: { createdAt: 'asc' } } },
  })
  if (!order) notFound()

  const subtotal = order.items.reduce((s,i)=> s + i.unitPriceMAD * i.quantity,0)
  const discountPercent = order.discountCode?.percent
  const discountAmount = discountPercent ? Math.floor(subtotal * discountPercent / 100) : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">Commande #{order.id}</h1>
  <form action={async (fd: FormData) => { 'use server'; await updateOrderStatusAction(fd); redirect(`/admin/orders/${order.id}`) }} className="flex items-center gap-2">
          <input type="hidden" name="orderId" value={order.id} />
          <select name="status" defaultValue={order.status} className="border rounded px-2 py-1 text-sm bg-background">
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <Button size="sm" variant="secondary">Mettre à jour</Button>
        </form>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Détails</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-muted-foreground">Client</span><span>{order.customer.email}</span>
              <span className="text-muted-foreground">Téléphone</span><span>{order.phone}</span>
              <span className="text-muted-foreground">Adresse</span><span>{order.addressLine1}, {order.city} {order.postalCode}</span>
              <span className="text-muted-foreground">Créée</span><span>{formatDate(order.createdAt)}</span>
              <span className="text-muted-foreground">Statut</span><span>{STATUS_LABEL[order.status] ?? order.status}</span>
              {order.discountCode && <><span className="text-muted-foreground">Code promo</span><span>{order.discountCode.code} ({order.discountCode.percent}%)</span></>}
            </div>
            <hr />
            <div className="space-y-3">
              {order.items.map(it => (
                <div key={it.id} className="flex justify-between gap-4">
                  <div>
                    <div className="font-medium">{it.painting.title}</div>
                    {(it.widthCm && it.heightCm) ? <div className="text-xs text-muted-foreground">{it.widthCm}×{it.heightCm} cm</div> : null}
                  </div>
                  <div className="text-right text-sm">{it.unitPriceMAD} MAD × {it.quantity}<br /><span className="font-semibold">{it.unitPriceMAD * it.quantity} MAD</span></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Montants</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Sous-total</span><span>{subtotal} MAD</span></div>
              {discountPercent && <div className="flex justify-between text-green-600"><span>Réduction ({discountPercent}%)</span><span>-{discountAmount} MAD</span></div>}
              <div className="flex justify-between"><span>Livraison</span><span>0 MAD</span></div>
              <hr />
              <div className="flex justify-between font-semibold"><span>Total</span><span>{order.totalMAD} MAD</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Historique statut</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              {order.statusHistory.map(h => (
                <div key={h.id} className="flex items-center justify-between gap-4 border-b last:border-0 pb-1">
                  <div>{STATUS_LABEL[h.status] ?? h.status}</div>
                  <div className="text-muted-foreground">{formatDate(h.createdAt)}</div>
                </div>
              ))}
              {order.statusHistory.length === 0 && <p className="text-muted-foreground">Aucun historique.</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'
