import { prisma } from '@/lib/db'
import { createStyle, updateStyle, deleteStyle } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AdminStylesPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const styles = await prisma.style.findMany({ orderBy: { name: 'asc' } })
  const resolvedParams = await searchParams
  const error = resolvedParams?.error ?? null
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Styles</h1>
      <section className="mb-6">
        <h2 className="font-medium mb-2">Add style</h2>
        <form action={createStyle} className="flex gap-2 max-w-md">
          <Input name="name" placeholder="e.g., abstrait" required />
          <Button type="submit">Add</Button>
        </form>
      </section>

      <ul className="space-y-2 max-w-lg">
        {styles.map(s => (
          <li key={s.id} className="border rounded p-3 flex items-center justify-between gap-3">
            <span className="truncate">{s.name}</span>
            <div className="flex gap-2">
              <form action={updateStyle} className="flex gap-2">
                <input type="hidden" name="id" value={s.id} />
                <Input name="name" defaultValue={s.name} className="w-40" required />
                <Button type="submit" variant="secondary">Save</Button>
              </form>
              <form action={deleteStyle}>
                <input type="hidden" name="id" value={s.id} />
                <Button type="submit" variant="destructive">Delete</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {styles.length === 0 && <p className="text-muted-foreground">No styles yet.</p>}
      {error && (
        <p className="text-red-600 text-sm mt-3">Error: {error}</p>
      )}
    </div>
  )
}
