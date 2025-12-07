import { prisma } from '@/lib/db'
import Link from 'next/link'

const STATUS_LABEL: Record<string,string> = {
  PENDING_REVIEW: 'En attente',
  IN_PROGRESS: 'En cours',
  READY_FOR_DELIVERY: 'Prête',
  COMPLETED: 'Terminée',
  CANCELED: 'Annulée'
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true, discountCode: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Commandes</h1>
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Client</th>
              <th className="text-left px-3 py-2">Articles</th>
              <th className="text-left px-3 py-2">Total (MAD)</th>
              <th className="text-left px-3 py-2">Réduc.</th>
              <th className="text-left px-3 py-2">Statut</th>
              <th className="text-left px-3 py-2">&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t hover:bg-muted/40">
                <td className="px-3 py-2 whitespace-nowrap align-top">{o.createdAt.toLocaleDateString('fr-MA', { day:'2-digit', month:'2-digit', year:'numeric' })}</td>
                <td className="px-3 py-2 align-top">
                  <div className="font-medium">{o.customer.email}</div>
                  <div className="text-[11px] text-muted-foreground">{o.phone}</div>
                </td>
                <td className="px-3 py-2 align-top">{o.items.length}</td>
                <td className="px-3 py-2 align-top font-medium">{o.totalMAD}</td>
                <td className="px-3 py-2 align-top">{o.discountCode ? `${o.discountCode.percent}%` : '-'}</td>
                <td className="px-3 py-2 align-top">
                  <span className="inline-flex items-center rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{STATUS_LABEL[o.status] ?? o.status}</span>
                </td>
                <td className="px-3 py-2 align-top">
                  <Link href={`/admin/orders/${o.id}`} className="text-primary hover:underline">Détails</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">Aucune commande</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

