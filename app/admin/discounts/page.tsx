import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { resolveDiscountStatus } from '@/lib/discounts'
import { createDiscount, updateDiscount, deleteDiscount } from './actions'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Discount Codes | Admin' }

function statusBadge(status: string) {
  const map: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 border-green-300',
    FUTURE: 'bg-blue-100 text-blue-700 border-blue-300',
    EXPIRED: 'bg-red-100 text-red-700 border-red-300',
    INACTIVE: 'bg-gray-100 text-gray-600 border-gray-300',
    EXHAUSTED: 'bg-amber-100 text-amber-700 border-amber-300',
  }
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${map[status] || 'bg-muted text-muted-foreground'}`}>{status}</span>
}

async function DiscountTable() {
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' }, include: { orders: true } })
  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left">
          <tr className="border-b">
            <th className="px-3 py-2 font-medium">Code</th>
            <th className="px-3 py-2 font-medium">Percent</th>
            <th className="px-3 py-2 font-medium">Validity</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Usage</th>
            <th className="px-3 py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {discounts.map(d => {
            const status = resolveDiscountStatus({ startsAt: d.startsAt ?? null, endsAt: d.endsAt ?? null })
            return (
              <tr key={d.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs tracking-tight">{d.code}</td>
                <td className="px-3 py-2">{d.percent}%</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {d.startsAt ? d.startsAt.toLocaleDateString() : '—'} → {d.endsAt ? d.endsAt.toLocaleDateString() : '—'}
                </td>
                <td className="px-3 py-2">{statusBadge(status)}</td>
                <td className="px-3 py-2 text-xs">{d.orders.length}</td>
                <td className="px-3 py-2">
                  <details className="group">
                    <summary className="text-xs underline cursor-pointer">Edit</summary>
                    <div className="mt-2 border rounded p-3 bg-background/80 space-y-2">
                      <form action={updateDiscount} className="grid gap-2 text-xs">
                        <input type="hidden" name="id" value={d.id} />
                        <label className="grid gap-1">
                          <span>Code</span>
                          <input name="code" defaultValue={d.code} className="input input-sm border rounded px-2 py-1 bg-background" />
                        </label>
                        <label className="grid gap-1">
                          <span>Percent</span>
                          <input name="percent" type="number" defaultValue={d.percent} min={1} max={90} className="input input-sm border rounded px-2 py-1 bg-background" />
                        </label>
                        <label className="grid gap-1">
                          <span>Starts At</span>
                          <input name="startsAt" type="date" defaultValue={d.startsAt ? d.startsAt.toISOString().slice(0,10) : ''} className="input input-sm border rounded px-2 py-1 bg-background" />
                        </label>
                        <label className="grid gap-1">
                          <span>Ends At</span>
                          <input name="endsAt" type="date" defaultValue={d.endsAt ? d.endsAt.toISOString().slice(0,10) : ''} className="input input-sm border rounded px-2 py-1 bg-background" />
                        </label>
                        <div className="flex gap-2 pt-1">
                          <button className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">Save</button>
                          <button className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground" formAction={deleteDiscount}>Delete</button>
                        </div>
                      </form>
                    </div>
                  </details>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {discounts.length === 0 && <div className="p-6 text-sm text-muted-foreground">No discount codes yet.</div>}
    </div>
  )
}

export default function DiscountsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">Discount Codes</h1>
        <p className="text-sm text-muted-foreground">Manage promotional / coupon codes (percentage only).</p>
      </header>
      <section className="space-y-4">
        <div className="border rounded-md p-4">
          <h2 className="font-medium mb-3 text-sm">Create Code</h2>
          <form action={createDiscount} className="grid gap-3 md:grid-cols-5 text-sm">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium">Code</label>
              <input required name="code" placeholder="SPRING25" className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Percent</label>
              <input required name="percent" type="number" min={1} max={90} defaultValue={10} className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Starts</label>
              <input name="startsAt" type="date" className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium">Ends</label>
              <input name="endsAt" type="date" className="border rounded px-2 py-1 bg-background" />
            </div>
            <div className="flex items-end">
              <button className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm">Create</button>
            </div>
          </form>
        </div>
        <Suspense fallback={<div className="text-sm text-muted-foreground">Loading discounts...</div>}>
          <DiscountTable />
        </Suspense>
      </section>
    </div>
  )
}
