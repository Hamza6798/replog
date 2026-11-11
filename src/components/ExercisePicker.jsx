import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Modal from './Modal.jsx'
import { queryExercises } from '../services/exerciseService.js'
import { CATEGORIES } from '../data/exercises.js'

export default function ExercisePicker({ onAdd, onClose, addedCodes, unique = false }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const results = useMemo(() => queryExercises({ search, category: category || null }), [search, category])
  return (
    <Modal title="Add exercises" onClose={onClose} wide>
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-ink px-3 py-2">
          <Search size={16} className="text-muted" />
          <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exercises" className="w-full bg-transparent text-sm outline-none" aria-label="Search exercises" />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-line bg-ink px-2 text-sm" aria-label="Category">
          <option value="">All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {results.slice(0, 40).map((e) => {
          const n = addedCodes.filter((c) => c === e.id).length
          return (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{e.name}</p>
                <p className="truncate text-xs text-muted">{e.primaryMuscle} • {e.equipment} • {e.difficulty}</p>
              </div>
              <button className="btn shrink-0 !py-1.5" disabled={unique && n > 0} onClick={() => onAdd(e.id)}>
                {unique && n > 0 ? 'Added' : <><Plus size={14} />{n ? `Add again (${n})` : 'Add'}</>}
              </button>
            </li>
          )
        })}
        {results.length === 0 && <li className="py-6 text-center text-sm text-muted">No exercises match.</li>}
      </ul>
      {results.length > 40 && <p className="mt-2 text-center text-xs text-muted">Showing 40 of {results.length}. Refine your search to see more.</p>}
      <div className="mt-4 flex justify-end"><button className="btn btn-lime" onClick={onClose}>Done</button></div>
    </Modal>
  )
}
