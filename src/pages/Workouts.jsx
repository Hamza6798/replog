import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Copy, Dumbbell, Pencil, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { deleteWorkout, duplicateWorkout, listWorkouts } from '../services/workoutService.js'

export default function Workouts() {
  const { user } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [workouts, setWorkouts] = useState(null)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setError('')
    listWorkouts().then(setWorkouts).catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  async function copy(w) {
    try { await duplicateWorkout(user.id, w.id); toast('Workout duplicated.'); load() } catch (e) { toast(e.message, 'error') }
  }
  async function remove() {
    setBusy(true)
    try { await deleteWorkout(toDelete.id); toast('Workout deleted.'); setToDelete(null); load() } catch (e) { toast(e.message, 'error') }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold uppercase">Workouts</h1>
        <Link to="/workout-builder" className="btn btn-lime"><Plus size={16} />New workout</Link>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-line bg-card p-4 text-sm">
          <p className="text-red-400">{error}</p>
          <button className="btn mt-3" onClick={load}>Try again</button>
        </div>
      )}
      {!error && !workouts && <p className="mt-10 text-center text-sm text-muted">Loading workouts…</p>}
      {workouts?.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <Dumbbell size={32} className="mb-3 text-muted" />
          <p className="font-medium">No workouts yet</p>
          <p className="mt-1 text-sm text-muted">Build your first workout from the exercise library.</p>
          <Link to="/workout-builder" className="btn btn-lime mt-4">Create a workout</Link>
        </div>
      )}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {workouts?.map((w) => (
          <article key={w.id} className="flex flex-col justify-between rounded-xl border border-line bg-card p-4">
            <div>
              <h2 className="truncate text-lg font-semibold">{w.name}</h2>
              <p className="mt-1 flex items-center gap-3 text-xs text-muted">
                <span>{w.count} {w.count === 1 ? 'exercise' : 'exercises'}</span>
                <span className="flex items-center gap-1"><Clock size={12} />~{w.minutes} min</span>
                <span>Updated {new Date(w.updatedAt).toLocaleDateString()}</span>
              </p>
              {w.notes && <p className="mt-2 line-clamp-2 text-sm text-muted">{w.notes}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn flex-1" onClick={() => nav(`/workout-builder/${w.id}`)}><Pencil size={14} />Edit</button>
              <button className="btn" onClick={() => copy(w)} aria-label={`Duplicate ${w.name}`}><Copy size={14} /></button>
              <button className="btn" onClick={() => setToDelete(w)} aria-label={`Delete ${w.name}`}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
      </div>
      {toDelete && <ConfirmDialog title="Delete workout?" message={`“${toDelete.name}” and its exercises will be permanently deleted.`} busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
