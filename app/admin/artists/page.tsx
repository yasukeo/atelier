import { prisma } from '@/lib/db'
import { createArtist, updateArtist, deleteArtist } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function AdminArtistsPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const artists = await prisma.artist.findMany({ orderBy: { name: 'asc' } })
  const resolvedParams = await searchParams
  const error = resolvedParams?.error ?? null
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Artists</h1>
      <section className="mb-6">
        <h2 className="font-medium mb-2">Add artist</h2>
        <form action={createArtist} className="grid gap-2 max-w-xl">
          <div className="flex gap-2">
            <Input name="name" placeholder="Name" required className="w-64" />
          </div>
          <input name="bio" placeholder="Bio (optional)" className="border rounded px-3 py-2" />
          <Button type="submit" className="w-fit">Add</Button>
        </form>
      </section>

      <ul className="space-y-2 max-w-3xl">
        {artists.map(a => (
          <li key={a.id} className="border rounded p-3 grid gap-2">
            <div className="font-medium">{a.name}</div>
            {a.bio && <div className="text-sm text-muted-foreground whitespace-pre-wrap">{a.bio}</div>}
            <div className="flex gap-2 items-start">
              <form action={updateArtist} className="flex flex-col sm:flex-row gap-2 flex-1">
                <input type="hidden" name="id" value={a.id} />
                <Input name="name" defaultValue={a.name} className="w-64" required />
                <input name="bio" defaultValue={a.bio ?? ''} placeholder="Bio (optional)" className="flex-1 border rounded px-3 py-2" />
                <Button type="submit" variant="secondary">Save</Button>
              </form>
              <form action={deleteArtist}>
                <input type="hidden" name="id" value={a.id} />
                <Button type="submit" variant="destructive">Delete</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {artists.length === 0 && <p className="text-muted-foreground">No artists yet.</p>}
      {error && (
        <p className="text-red-600 text-sm mt-3">Error: {error}</p>
      )}
    </div>
  )
}
