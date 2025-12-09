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

function FilterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  )
}

function ChevronIcon({ open, className = "w-4 h-4" }: { open: boolean; className?: string }) {
  return (
    <svg className={`${className} transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function Filters({ artists, styles, techniques }: { artists: {id:string; name:string}[]; styles: {id:string; name:string}[]; techniques: {id:string; name:string}[] }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const [q, setQ] = useState(searchParams.get('q') || '')
  const debouncedQ = useDebounce(q, 400)

  // Count active filters
  const filterKeys = ['artist','style','technique','minPrice','maxPrice','minWidth','maxWidth','minHeight','maxHeight','kind','q']
  const activeFilters = filterKeys.filter(k => searchParams.get(k)).length

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
      {/* Mobile Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full flex items-center justify-between py-2 text-sm font-medium text-[#6B2D2D]"
      >
        <span className="flex items-center gap-2">
          <FilterIcon />
          Filtres
          {activeFilters > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-[10px] font-bold bg-[#6B2D2D] text-white rounded-full">
              {activeFilters}
            </span>
          )}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {/* Desktop: always visible, Mobile: collapsible */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block space-y-4`}>
        <div>
          <label className="block text-xs font-medium mb-1 text-[#2D2A26]">Recherche</label>
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Titre, artiste..." className="h-9 text-sm" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#2D2A26]">Artiste</label>
            <select className="w-full border border-[#D8D5C8] rounded h-9 text-sm bg-white px-2 text-[#2D2A26]" value={current('artist')} onChange={e => setParam('artist', e.target.value || undefined)}>
              <option value="">Tous</option>
              {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#2D2A26]">Style</label>
            <select className="w-full border border-[#D8D5C8] rounded h-9 text-sm bg-white px-2 text-[#2D2A26]" value={current('style')} onChange={e => setParam('style', e.target.value || undefined)}>
              <option value="">Tous</option>
              {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#2D2A26]">Technique</label>
            <select className="w-full border border-[#D8D5C8] rounded h-9 text-sm bg-white px-2 text-[#2D2A26]" value={current('technique')} onChange={e => setParam('technique', e.target.value || undefined)}>
              <option value="">Toutes</option>
              {techniques.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      <div className="space-y-5">
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
        <div className="space-y-1">
          <label className="block text-xs font-medium text-[#2D2A26]">Type</label>
          <select className="w-full border border-[#D8D5C8] rounded h-9 text-sm bg-white px-2 text-[#2D2A26]" value={current('kind')} onChange={e => setParam('kind', e.target.value || undefined)}>
            <option value="">Tous</option>
            <option value="UNIQUE">Unique</option>
            <option value="RECREATABLE">Recréable</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" size="sm" className="text-xs flex-1 border-[#D8D5C8] text-[#6B2D2D]" onClick={() => {
          const keys = ['q','artist','style','technique','minPrice','maxPrice','minWidth','maxWidth','minHeight','maxHeight','kind']
          const sp = new URLSearchParams(searchParams.toString())
          keys.forEach(k => sp.delete(k))
          router.replace(pathname + (sp.toString() ? '?' + sp.toString() : ''), { scroll: false })
          setQ('')
        }}>Réinitialiser</Button>
      </div>
      </div>
    </div>
  )
}
