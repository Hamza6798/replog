import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X, SlidersHorizontal, SearchX } from 'lucide-react'
import ExerciseCard from '../components/ExerciseCard.jsx'
import useDebounce from '../hooks/useDebounce.js'
import { queryExercises } from '../services/exerciseService.js'
import { CATEGORIES, EQUIPMENT, DIFFICULTIES, MUSCLES } from '../data/exercises.js'

const PAGE = 12
const FACETS = [
  ['category', 'Category', CATEGORIES],
  ['muscle', 'Muscle', MUSCLES],
  ['equipment', 'Equipment', EQUIPMENT],
  ['difficulty', 'Difficulty', DIFFICULTIES],
]
const SORTS = [['name-asc', 'Name A–Z'], ['name-desc', 'Name Z–A'], ['diff-asc', 'Easiest first'], ['diff-desc', 'Hardest first']]

// Search, filters and sort live in the URL, so "Back" from an exercise page
// returns to exactly the same results.
export default function Exercises() {
  const [params, setParams] = useSearchParams()
  const focusFacet = params.get('facet')
  const urlQ = params.get('q') ?? ''
  const sort = params.get('sort') || 'name-asc'
  const filters = Object.fromEntries(FACETS.map(([k, , opts]) => [k, opts.includes(params.get(k)) ? params.get(k) : null]))

  const [search, setSearch] = useState(urlQ)
  const [showAll, setShowAll] = useState(false)
  const [visible, setVisible] = useState(PAGE)
  const debounced = useDebounce(search)
  const lastWritten = useRef(urlQ)

  const patch = (changes) => setParams((p) => {
    const n = new URLSearchParams(p)
    Object.entries(changes).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)))
    return n
  }, { replace: true })

  // URL changed from outside (e.g. sidebar link): pull it into the input.
  useEffect(() => { if (urlQ !== lastWritten.current) { lastWritten.current = urlQ; setSearch(urlQ) } }, [urlQ])
  // User typed: write the debounced text to the URL.
  useEffect(() => { if (debounced !== lastWritten.current) { lastWritten.current = debounced; patch({ q: debounced }) } }, [debounced]) // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => queryExercises({ search: debounced, sort, ...filters }), [debounced, sort, params]) // eslint-disable-line react-hooks/exhaustive-deps
  const active = Object.values(filters).filter(Boolean).length + (search ? 1 : 0)

  const setFilter = (key, val) => { patch({ [key]: filters[key] === val ? null : val }); setVisible(PAGE) }
  const clear = () => { setSearch(''); lastWritten.current = ''; patch({ q: null, category: null, muscle: null, equipment: null, difficulty: null }); setVisible(PAGE) }
  const shownFacets = showAll ? FACETS : FACETS.filter(([k]) => k === focusFacet)

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 focus-within:border-muted">
          <Search size={18} className="text-muted" />
          <input autoFocus={!focusFacet} value={search} onChange={(e) => { setSearch(e.target.value); setVisible(PAGE) }} placeholder="Search by name or muscle, e.g. chest dumbbell" className="w-full bg-transparent text-sm outline-none placeholder:text-muted" aria-label="Search exercises" />
          {search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={16} className="text-muted hover:text-fg" /></button>}
        </label>
        <button className={`btn ${showAll ? 'btn-lime' : ''}`} onClick={() => setShowAll((s) => !s)} aria-expanded={showAll}><SlidersHorizontal size={16} /><span className="hidden sm:inline">Filters</span></button>
      </div>

      {shownFacets.map(([key, label, options]) => (
        <div key={key} className="mt-3 flex items-center gap-2">
          <span className="w-20 shrink-0 text-[11px] uppercase tracking-wider text-muted">{label}</span>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {options.map((o) => <button key={o} onClick={() => setFilter(key, o)} className={`chip ${filters[key] === o ? 'chip-on' : ''}`}>{o}</button>)}
          </div>
        </div>
      ))}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-display text-xl font-bold uppercase" aria-live="polite">{results.length} {results.length === 1 ? 'Result' : 'Results'}</span>
          {active > 0 && <button onClick={clear} className="text-xs text-lime underline-offset-2 hover:underline">Clear filters ({active})</button>}
        </div>
        <label className="flex items-center gap-2 text-xs text-muted">Sort
          <select value={SORTS.some(([v]) => v === sort) ? sort : 'name-asc'} onChange={(e) => patch({ sort: e.target.value === 'name-asc' ? null : e.target.value })} className="rounded-lg border border-line bg-card px-2 py-1.5 text-fg outline-none">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
      </div>

      {Object.values(filters).some(Boolean) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k, v)} className="chip chip-on gap-1">{v}<X size={12} /></button>
          ))}
        </div>
      )}

      {results.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <SearchX size={32} className="mb-3 text-muted" />
          <p className="font-medium">No exercises match</p>
          <p className="mt-1 text-sm text-muted">Try fewer filters or a different search.</p>
          <button onClick={clear} className="btn btn-lime mt-4">Clear filters</button>
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {results.slice(0, visible).map((e) => <ExerciseCard key={e.id} exercise={e} />)}
          </div>
          {visible < results.length && (
            <div className="mt-6 text-center">
              <button className="btn" onClick={() => setVisible((v) => v + PAGE)}>Load more ({results.length - visible} left)</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
