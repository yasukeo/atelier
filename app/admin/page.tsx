import { prisma } from '@/lib/db'
import { Suspense } from 'react'

export const revalidate = 30

export default async function AdminPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
  <p className="text-muted-foreground text-sm">Vue d&apos;ensemble des performances (30 derniers jours).</p>
      </header>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Chargement des indicateurs…</div>}>
        <KPISection />
      </Suspense>
      <Suspense fallback={<div className="text-sm text-muted-foreground">Chargement des commandes…</div>}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

async function KPISection() {
  const now = new Date()
  const since = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30)

  const [orders, statusCounts, uniquePaintings, soldUniqueOriginals, topPaintingAgg] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: 'CANCELED' } },
      select: { id: true, totalMAD: true, createdAt: true },
    }),
    prisma.order.groupBy({ by: ['status'], _count: { status: true }, where: { createdAt: { gte: since } } }),
    prisma.painting.count({ where: { kind: 'UNIQUE' } }),
    prisma.orderItem.count({ where: { painting: { kind: 'UNIQUE' }, order: { status: { not: 'CANCELED' } } } }),
    prisma.orderItem.groupBy({
      by: ['paintingId'],
      where: { order: { createdAt: { gte: since }, status: { not: 'CANCELED' } } },
      _sum: { unitPriceMAD: true, quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 1,
    }),
  ])

  const revenue = orders.reduce((acc, o) => acc + o.totalMAD, 0)
  const ordersCount = orders.length
  const aov = ordersCount ? Math.round(revenue / ordersCount) : 0
  const statusMap = Object.fromEntries(statusCounts.map(s => [s.status, s._count.status])) as Record<string, number>
  const pending = statusMap['PENDING_REVIEW'] || 0
  const inProgress = statusMap['IN_PROGRESS'] || 0
  const completed = statusMap['COMPLETED'] || 0
  const recreatableOrders = await prisma.orderItem.count({ where: { painting: { kind: 'RECREATABLE' }, order: { status: { not: 'CANCELED' } } } })
  const recreatableRatio = (recreatableOrders + soldUniqueOriginals) ? (recreatableOrders / (recreatableOrders + soldUniqueOriginals)) : 0
  let topPaintingTitle: string | null = null
  if (topPaintingAgg.length) {
    const top = await prisma.painting.findUnique({ where: { id: topPaintingAgg[0].paintingId }, select: { title: true } })
    topPaintingTitle = top?.title || null
  }

  const cards: Array<{ label: string; value: string; sub?: string } > = [
    { label: 'Revenu (30j)', value: formatMAD(revenue) },
    { label: 'Commandes', value: String(ordersCount) },
    { label: 'AOV', value: formatMAD(aov) },
    { label: 'En attente', value: String(pending) },
    { label: 'En cours', value: String(inProgress) },
    { label: 'Terminées', value: String(completed) },
    { label: 'Top oeuvre', value: topPaintingTitle ?? '—' },
    { label: 'Ratio Recréable', value: (recreatableRatio * 100).toFixed(1) + '%' },
    { label: 'Sell-through', value: uniquePaintings ? ((soldUniqueOriginals / uniquePaintings) * 100).toFixed(1) + '%' : '—' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map(c => (
        <div key={c.label} className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm hover:shadow transition">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{c.label}</div>
          <div className="text-lg font-semibold leading-none">{c.value}</div>
          {c.sub && <div className="text-[10px] text-muted-foreground mt-1">{c.sub}</div>}
        </div>
      ))}
    </div>
  )
}

async function RecentOrders() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { items: true },
  })
  if (!orders.length) {
    return <div className="text-sm text-muted-foreground">Aucune commande récente.</div>
  }
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-tight">Commandes récentes</h2>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left font-medium p-2 whitespace-nowrap">ID</th>
              <th className="text-left font-medium p-2 whitespace-nowrap">Date</th>
              <th className="text-left font-medium p-2 whitespace-nowrap">Montant</th>
              <th className="text-left font-medium p-2 whitespace-nowrap">Articles</th>
              <th className="text-left font-medium p-2 whitespace-nowrap">Statut</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t">
                <td className="p-2 font-mono text-xs">{o.id.slice(0,8)}</td>
                <td className="p-2">{o.createdAt.toLocaleDateString()}</td>
                <td className="p-2 font-medium">{formatMAD(o.totalMAD)}</td>
                <td className="p-2">{o.items.length}</td>
                <td className="p-2">{renderStatusBadge(o.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderStatusBadge(status: string) {
  const base = 'inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium border'
  const map: Record<string, string> = {
    PENDING_REVIEW: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
    IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800',
    READY_FOR_DELIVERY: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
    CANCELED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800',
  }
  return <span className={`${base} ${map[status] || 'bg-muted text-muted-foreground border-muted'}`}>{status.replaceAll('_',' ')}</span>
}

function formatMAD(v: number) {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(v)
}
