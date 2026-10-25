"use client"
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { RangeSlider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

type Option = { id: string; name: string }

const PRICE_MAX = 10000
const SIZE_MAX = 500
const ALL_KEYS = ['q','artist','style','technique','minPrice','maxPrice','minWidth','maxWidth','minHeight','maxHeight','kind','orientation','sort']
// Filters that live in the "more filters" panel (counted on its toggle)
const PANEL_KEYS = ['artist','style','technique','minPrice','maxPrice','minWidth','maxWidth','minHeight','maxHeight']

const KINDS = [
  { value: '', label: 'Toutes' },
  { value: 'UNIQUE', label: 'Pièces uniques' },
  { value: 'RECREATABLE', label: 'Re-créations' },
]
const ORIENTATIONS = [
  { value: '', label: 'Tous formats' },
  { value: 'PORTRAIT', label: 'Portrait' },
  { value: 'PAYSAGE', label: 'Paysage' },
  { value: 'CARRE', label: 'Carré' },
]

function useDebounce<T>(value: T, ms: number) {
  const [v, setV] = useState(value)
  useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id) }, [value, ms])
  return v
}

// A row of mutually exclusive choices that each update the URL
function Segmented({ label, options, value, onChange }: { label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center gap-1">
      {options.map(o => {
        const active = value === o.value
        return (
          <button
            key={o.value || 'all'}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 px-3.5 text-[13px] whitespace-nowrap rounded-full border transition-colors',
              active ? 'border-encre bg-encre text-chaux' : 'border-transparent text-encre/70 hover:text-encre hover:border-trait'
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function SelectField({ id, label, value, onChange, children }: { id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-[13px] font-medium text-encre">{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)} className="w-full h-10 rounded-sm border border-input bg-papier px-3 text-sm text-encre focus-visible:border-encre focus-visible:outline-none">
        {children}
      </select>
    </div>
  )
}

export function Filters({ artists, styles, techniques }: { artists: Option[]; styles: Option[]; techniques: Option[] }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  // Opened from the start when the URL already uses one of its filters
  const [panelOpen, setPanelOpen] = useState(() => PANEL_KEYS.some(k => searchParams.get(k)))
  const [q, setQ] = useState(searchParams.get('q') || '')
  const debouncedQ = useDebounce(q, 400)

  const current = (key: string) => searchParams.get(key) || ''
  const panelCount = PANEL_KEYS.filter(k => searchParams.get(k)).length
  const anyActive = ALL_KEYS.some(k => k !== 'sort' && searchParams.get(k))

  // Batch param changes in one navigation so they don't overwrite each other
  const setParams = useCallback((entries: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString())
    Object.entries(entries).forEach(([key, value]) => {
      if (value && value.length) sp.set(key, value)
      else sp.delete(key)
    })
    sp.delete('page')
    const next = sp.toString()
    if (next === searchParams.toString()) return
    router.replace(pathname + (next ? '?' + next : ''), { scroll: false })
  }, [searchParams, pathname, router])

  const setParam = useCallback((key: string, value: string | undefined) => setParams({ [key]: value }), [setParams])

  useEffect(() => { setParam('q', debouncedQ.trim() || undefined) }, [debouncedQ, setParam])

  function resetAll() {
    const sp = new URLSearchParams(searchParams.toString())
    ALL_KEYS.forEach(k => sp.delete(k))
    router.replace(pathname + (sp.toString() ? '?' + sp.toString() : ''), { scroll: false })
    setQ('')
  }

  const range = (minKey: string, maxKey: string, max: number) =>
    [Number(current(minKey)) || 0, Number(current(maxKey)) || max]
  const commitRange = (minKey: string, maxKey: string, max: number) => (v: number[]) =>
    setParams({ [minKey]: v[0] === 0 ? undefined : String(v[0]), [maxKey]: v[1] === max ? undefined : String(v[1]) })

  return (
    <div className="border-y border-trait">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-3">
        <div className="relative w-full sm:w-64">
          <label htmlFor="filter-q" className="sr-only">Rechercher une œuvre</label>
          <svg aria-hidden="true" className="absolute left-0 top-1/2 -translate-y-1/2 size-4 text-pierre" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-3.5-3.5" /></svg>
          <input
            id="filter-q"
            type="search"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Titre, artiste…"
            className="w-full h-10 bg-transparent pl-7 text-base md:text-sm text-encre placeholder:text-pierre/80 border-b border-transparent focus:border-encre focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto w-full lg:w-auto [scrollbar-width:none]">
          <Segmented label="Type d'œuvre" options={KINDS} value={current('kind')} onChange={v => setParam('kind', v || undefined)} />
          <span aria-hidden="true" className="h-5 w-px bg-trait shrink-0" />
          <Segmented label="Format" options={ORIENTATIONS} value={current('orientation')} onChange={v => setParam('orientation', v || undefined)} />
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <label htmlFor="filter-sort" className="sr-only">Trier par</label>
          <select
            id="filter-sort"
            value={current('sort')}
            onChange={e => setParam('sort', e.target.value || undefined)}
            className="h-9 bg-transparent pr-1 text-[13px] text-encre/80 hover:text-encre focus-visible:outline-none cursor-pointer"
          >
            <option value="">Plus récentes</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
          <button
            type="button"
            onClick={() => setPanelOpen(o => !o)}
            aria-expanded={panelOpen}
            aria-controls="filtres-avances"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full border border-trait text-[13px] text-encre hover:border-encre transition-colors"
          >
            Plus de filtres
            {panelCount > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-grenat px-1 text-[11px] font-semibold text-white">{panelCount}</span>}
          </button>
        </div>
      </div>

      <div id="filtres-avances" hidden={!panelOpen} className="border-t border-trait py-8">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <SelectField id="filter-artist" label="Artiste" value={current('artist')} onChange={v => setParam('artist', v || undefined)}>
            <option value="">Tous les artistes</option>
            {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </SelectField>
          <SelectField id="filter-style" label="Style" value={current('style')} onChange={v => setParam('style', v || undefined)}>
            <option value="">Tous les styles</option>
            {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </SelectField>
          <SelectField id="filter-technique" label="Technique" value={current('technique')} onChange={v => setParam('technique', v || undefined)}>
            <option value="">Toutes les techniques</option>
            {techniques.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </SelectField>
          <RangeSlider
            label="Prix (MAD)"
            min={0} max={PRICE_MAX} step={50}
            value={range('minPrice', 'maxPrice', PRICE_MAX)}
            onValueCommit={commitRange('minPrice', 'maxPrice', PRICE_MAX)}
            minStepsBetweenThumbs={2}
          />
          <RangeSlider
            label="Largeur (cm)"
            min={0} max={SIZE_MAX} step={5}
            value={range('minWidth', 'maxWidth', SIZE_MAX)}
            onValueCommit={commitRange('minWidth', 'maxWidth', SIZE_MAX)}
            minStepsBetweenThumbs={1}
          />
          <RangeSlider
            label="Hauteur (cm)"
            min={0} max={SIZE_MAX} step={5}
            value={range('minHeight', 'maxHeight', SIZE_MAX)}
            onValueCommit={commitRange('minHeight', 'maxHeight', SIZE_MAX)}
            minStepsBetweenThumbs={1}
          />
        </div>
      </div>

      {anyActive && (
        <div className="border-t border-trait py-3 text-[13px]">
          <button type="button" onClick={resetAll} className="lien">Effacer les filtres</button>
        </div>
      )}
    </div>
  )
}
