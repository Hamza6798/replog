import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import ExerciseMedia from './ExerciseMedia.jsx'

export default function ExerciseCard({ exercise: e }) {
  return (
    <Link to={`/exercises/${e.id}`} className="group flex gap-4 rounded-xl border border-line bg-card p-3 transition hover:border-muted">
      <ExerciseMedia exercise={e} className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{e.name}</h3>
            <p className="mt-0.5 truncate text-xs text-muted">{e.primaryMuscle} • {e.category} • {e.difficulty}</p>
          </div>
          <span className="font-mono text-[11px] text-muted">ID: {e.id}</span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex flex-wrap gap-1.5">
            <span className="tag">{e.equipment}</span>
            <span className="tag">{e.type}</span>
          </div>
          <ChevronRight size={16} className="text-muted transition group-hover:translate-x-0.5 group-hover:text-lime" />
        </div>
      </div>
    </Link>
  )
}
