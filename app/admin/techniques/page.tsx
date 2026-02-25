import { prisma } from '@/lib/db'
import { createTechnique, updateTechnique, deleteTechnique } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function AdminTechniquesPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const techniques = await prisma.technique.findMany({ orderBy: { name: 'asc' } })
  const resolvedParams = await searchParams
  const error = resolvedParams?.error ?? null
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Techniques</h1>
      <section className="mb-6">
        <h2 className="font-medium mb-2">Add technique</h2>
        <form action={createTechnique} className="flex gap-2 max-w-md">
          <Input name="name" placeholder="e.g., huile" required />
          <Button type="submit">Add</Button>
        </form>
      </section>

      <ul className="space-y-2 max-w-lg">
        {techniques.map(t => (
          <li key={t.id} className="border rounded p-3 flex items-center justify-between gap-3">
            <span className="truncate">{t.name}</span>
            <div className="flex gap-2">
              <form action={updateTechnique} className="flex gap-2">
                <input type="hidden" name="id" value={t.id} />
                <Input name="name" defaultValue={t.name} className="w-40" required />
                <Button type="submit" variant="secondary">Save</Button>
              </form>
              <form action={deleteTechnique}>
                <input type="hidden" name="id" value={t.id} />
                <Button type="submit" variant="destructive">Delete</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {techniques.length === 0 && <p className="text-muted-foreground">No techniques yet.</p>}
      {error && (
        <p className="text-red-600 text-sm mt-3">Error: {error}</p>
      )}
    </div>
  )
}
