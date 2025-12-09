import { prisma } from '@/lib/db'
import { createPainting, updatePainting, deletePainting, deletePaintingImage } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import ClientEnhancements, { MultiImageDrop } from './ui.client'

export default async function AdminPaintingsPage({ searchParams }: { searchParams?: { error?: string; success?: string } }) {
  const [paintings, artists, styles, techniques] = await Promise.all([
    prisma.painting.findMany({
      include: { artist: true, style: true, technique: true, images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.artist.findMany({ orderBy: { name: 'asc' } }),
    prisma.style.findMany({ orderBy: { name: 'asc' } }),
    prisma.technique.findMany({ orderBy: { name: 'asc' } }),
  ])
  const error = searchParams?.error ?? null
  const success = searchParams?.success ?? null
  return (
    <div>
      <ClientEnhancements success={success} error={error} />
      <h1 className="text-2xl font-semibold mb-4">Paintings</h1>
      <section className="mb-6">
        <h2 className="font-medium mb-2">Add painting</h2>
  <form action={createPainting} className="grid gap-2 max-w-3xl">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input name="title" placeholder="Title" required />
            <Input name="priceMAD" type="number" placeholder="Price (MAD)" min={0} required />
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input name="widthCm" type="number" placeholder="Width (cm)" min={1} required />
            <Input name="heightCm" type="number" placeholder="Height (cm)" min={1} required />
            <select name="orientation" className="border rounded px-3 py-2" required>
              <option value="PORTRAIT">Portrait</option>
              <option value="PAYSAGE">Paysage</option>
              <option value="CARRE">Carré</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <select name="kind" className="border rounded px-3 py-2" required>
              <option value="UNIQUE">Unique</option>
              <option value="RECREATABLE">Recreatable</option>
            </select>
            <select name="artistId" className="border rounded px-3 py-2" required>
              <option value="">Artist…</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <Input name="leadTimeWeeks" placeholder="Lead time (e.g., 1 à 3 semaines)" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <select name="styleId" className="border rounded px-3 py-2">
              <option value="">Style…</option>
              {styles.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select name="techniqueId" className="border rounded px-3 py-2">
              <option value="">Technique…</option>
              {techniques.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="available" defaultChecked /> Disponible (visible dans la galerie)</label>
          </div>
          <div>
            <MultiImageDrop name="images" />
          </div>
          <Button type="submit" className="w-fit">Ajouter</Button>
        </form>
      </section>
      <ul className="space-y-2">
        {paintings.map(p => (
          <li key={p.id} className="border rounded p-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{p.title}</span>
              {p.available ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Visible</span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Masqué</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.kind === 'UNIQUE' ? 'Unique' : 'Recréable'}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {p.artist?.name ?? '—'} • {p.style?.name ?? '—'} • {p.technique?.name ?? '—'} • {p.widthCm}×{p.heightCm}cm • {p.priceMAD} MAD
            </div>
            {p.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {p.images.map(img => (
                  <div key={img.id} className="relative group border rounded overflow-hidden w-24 h-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt || p.title} className="object-cover w-full h-full" />
                    <form action={deletePaintingImage} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                      <input type="hidden" name="id" value={img.id} />
                      <button type="submit" className="bg-red-600 text-white text-[10px] px-1 py-0.5 rounded">×</button>
                    </form>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <form action={updatePainting} className="grid gap-2 sm:col-span-2 sm:grid-cols-3">
                <input type="hidden" name="id" value={p.id} />
                <Input name="title" defaultValue={p.title} required />
                <Input name="priceMAD" type="number" defaultValue={p.priceMAD} min={0} required />
                <div className="grid gap-2 sm:grid-cols-3 sm:col-span-3">
                  <Input name="widthCm" type="number" defaultValue={p.widthCm} min={1} required />
                  <Input name="heightCm" type="number" defaultValue={p.heightCm} min={1} required />
                  <select name="orientation" defaultValue={p.orientation} className="border rounded px-3 py-2" required>
                    <option value="PORTRAIT">Portrait</option>
                    <option value="PAYSAGE">Paysage</option>
                    <option value="CARRE">Carré</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 sm:col-span-3">
                  <select name="kind" defaultValue={p.kind} className="border rounded px-3 py-2" required>
                    <option value="UNIQUE">Unique</option>
                    <option value="RECREATABLE">Recreatable</option>
                  </select>
                  <select name="artistId" defaultValue={p.artistId} className="border rounded px-3 py-2" required>
                    {artists.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                  <Input name="leadTimeWeeks" defaultValue={p.leadTimeWeeks ?? ''} placeholder="Lead time" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 sm:col-span-3">
                  <select name="styleId" defaultValue={p.styleId ?? ''} className="border rounded px-3 py-2">
                    <option value="">Style…</option>
                    {styles.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <select name="techniqueId" defaultValue={p.techniqueId ?? ''} className="border rounded px-3 py-2">
                    <option value="">Technique…</option>
                    {techniques.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm sm:col-span-3">
                  <input type="checkbox" name="available" defaultChecked={p.available} /> Disponible (visible dans la galerie)
                </label>
                <div className="sm:col-span-3">
                  <MultiImageDrop name="images" />
                </div>
                <Button type="submit" variant="secondary" className="w-fit sm:col-span-3">Enregistrer</Button>
              </form>
              <form action={deletePainting} className="sm:col-span-1 self-start">
                <input type="hidden" name="id" value={p.id} />
                <Button type="submit" variant="destructive">Supprimer</Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      {paintings.length === 0 && <p className="text-muted-foreground">No paintings yet.</p>}
      {error && (
        <p className="text-red-600 text-sm mt-3">Error: {error}</p>
      )}
    </div>
  )
}

