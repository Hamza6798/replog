import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, ListOrdered, Plus, Bookmark } from 'lucide-react'
import ExerciseMedia from '../components/ExerciseMedia.jsx'
import ExerciseCard from '../components/ExerciseCard.jsx'
import SaveToCollectionModal from '../components/SaveToCollectionModal.jsx'
import AddToWorkoutModal from '../components/AddToWorkoutModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import ComingSoon from './ComingSoon.jsx'
import { getExerciseById, getRelatedExercises } from '../services/exerciseService.js'

function Fact({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  )
}

export default function ExerciseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const e = getExerciseById(id)
  if (!e) return <ComingSoon title="Exercise not found" text="No exercise has that ID." />
  const related = getRelatedExercises(e)

  return (
    <div className="mx-auto max-w-5xl">
      <button onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/exercises'))} className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft size={16} /> Back to results
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        <ExerciseMedia exercise={e} large className="w-full" />
        <div>
          <p className="font-mono text-xs text-muted">ID: {e.id}</p>
          <h1 className="mt-1 font-display text-4xl font-bold uppercase leading-none sm:text-5xl">{e.name}</h1>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Fact label="Primary muscle" value={e.primaryMuscle} />
            <Fact label="Secondary muscles" value={e.secondaryMuscles.length ? e.secondaryMuscles.join(', ') : 'None'} />
            <Fact label="Equipment" value={e.equipment} />
            <Fact label="Difficulty" value={e.difficulty} />
            <Fact label="Type" value={e.type} />
            <Fact label="Category" value={e.category} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={() => (user ? setAdding(true) : navigate('/login', { state: { from: `/exercises/${e.id}` } }))} className="btn btn-lime"><Plus size={16} />Add to workout</button>
            <button onClick={() => (user ? setSaving(true) : navigate('/login', { state: { from: `/exercises/${e.id}` } }))} className="btn"><Bookmark size={16} />Save to collection</button>
          </div>
          <p className="mt-2 text-xs text-muted">Saving to a workout or collection needs a free account.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold uppercase"><ListOrdered size={18} className="text-lime" />Instructions</h2>
          <ol className="space-y-3">
            {e.instructions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-xs text-lime">{i + 1}</span>
                <span className="pt-0.5">{s}.</span>
              </li>
            ))}
          </ol>
        </section>
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-2xl font-bold uppercase"><AlertTriangle size={18} className="text-lime" />Common mistakes</h2>
          <ul className="space-y-3">
            {e.mistakes.map((m, i) => <li key={i} className="flex gap-3 text-sm"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lime" /><span>{m}.</span></li>)}
          </ul>
        </section>
      </div>
      <p className="mt-4 text-xs text-muted">General exercise information only, not medical advice or personal coaching. Start light and stop if something hurts.{e.images.length > 0 && ' Photos: Free Exercise DB (public domain).'}</p>

      <section className="mt-8">
        <h2 className="mb-3 font-display text-2xl font-bold uppercase">Related exercises</h2>
        <div className="grid gap-3 md:grid-cols-2">{related.map((r) => <ExerciseCard key={r.id} exercise={r} />)}</div>
        <Link to={`/exercises?facet=muscle`} className="mt-4 inline-block text-sm text-lime hover:underline">Browse by muscle</Link>
      </section>
      {adding && <AddToWorkoutModal exercise={e} onClose={() => setAdding(false)} />}
  {saving && <SaveToCollectionModal exercise={e} onClose={() => setSaving(false)} />}
    </div>
  )
}
