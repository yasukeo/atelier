"use client"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RangeSlider } from '@/components/ui/slider'

function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id) }, [value, ms])
  return v
}

export function Filters({ artists, styles, techniques }: { artists: {id:string; name:string}[]; styles: {id:string; name:string}[]; techniques: {id:string; name:string}[] }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const debouncedQ = useDebounce(q, 400)

  const setParam = useCallback((key: string, value: string | undefined) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (value && value.length) {
      sp.set(key, value)
    } else {
      sp.delete(key)
    }
    sp.delete('page') // reset page when filtering
    router.replace(pathname + '?' + sp.toString(), { scroll: false })
  }, [searchParams, pathname, router])

  // Batch multiple param changes in one navigation to avoid overwriting
  const setParams = useCallback((entries: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(entries).forEach(([key, value]) => {
      if (value && value.length) sp.set(key, value)
      else sp.delete(key)
    })
    sp.delete('page')
    router.replace(pathname + (sp.size ? '?' + sp.toString() : ''), { scroll: false })
  }, [searchParams, pathname, router])

  // Apply debounced search term
  useEffect(() => { setParam('q', debouncedQ.trim() || undefined) }, [debouncedQ, setParam])

  const current = (key: string) => searchParams.get(key) || ''

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1">Recherche</label>
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Titre, artiste..." />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium">Artiste</label>
          <select className="w-full border rounded h-9 text-sm bg-background" value={current('artist')} onChange={e => setParam('artist', e.target.value || undefined)}>
            <option value="">Tous</option>
            {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium">Style</label>
            <select className="w-full border rounded h-9 text-sm bg-background" value={current('style')} onChange={e => setParam('style', e.target.value || undefined)}>
              <option value="">Tous</option>
              {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-medium">Technique</label>
            <select className="w-full border rounded h-9 text-sm bg-background" value={current('technique')} onChange={e => setParam('technique', e.target.value || undefined)}>
              <option value="">Toutes</option>
              {techniques.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
      </div>
      <div className="space-y-6">
        <RangeSlider
          label="Prix (MAD)"
          min={0} max={10000} step={50}
          value={[ Number(current('minPrice')) || 0, Number(current('maxPrice')) || 10000 ]}
          onValueCommit={(v:number[]) => {
            setParams({
              minPrice: v[0] === 0 ? undefined : String(v[0]),
              maxPrice: v[1] === 10000 ? undefined : String(v[1])
            })
          }}
          minStepsBetweenThumbs={2}
        />
        <RangeSlider
          label="Largeur (cm)"
          min={0} max={500} step={5}
          value={[ Number(current('minWidth')) || 0, Number(current('maxWidth')) || 500 ]}
          onValueCommit={(v:number[]) => {
            setParams({
              minWidth: v[0] === 0 ? undefined : String(v[0]),
              maxWidth: v[1] === 500 ? undefined : String(v[1])
            })
          }}
          minStepsBetweenThumbs={1}
        />
        <RangeSlider
          label="Hauteur (cm)"
          min={0} max={500} step={5}
          value={[ Number(current('minHeight')) || 0, Number(current('maxHeight')) || 500 ]}
          onValueCommit={(v:number[]) => {
            setParams({
              minHeight: v[0] === 0 ? undefined : String(v[0]),
              maxHeight: v[1] === 500 ? undefined : String(v[1])
            })
          }}
          minStepsBetweenThumbs={1}
        />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium">Type</label>
            <select className="w-full border rounded h-9 text-sm bg-background" value={current('kind')} onChange={e => setParam('kind', e.target.value || undefined)}>
              <option value="">Tous</option>
              <option value="UNIQUE">Unique</option>
              <option value="RECREATABLE">Recréable</option>
            </select>
          </div>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="text-xs" onClick={() => {
          const keys = ['q','artist','style','technique','minPrice','maxPrice','minWidth','maxWidth','minHeight','maxHeight','kind']
          const sp = new URLSearchParams(searchParams.toString())
          keys.forEach(k => sp.delete(k))
          router.replace(pathname + (sp.toString() ? '?' + sp.toString() : ''), { scroll: false })
          setQ('')
        }}>Réinitialiser</Button>
      </div>
    </div>
  )
}
