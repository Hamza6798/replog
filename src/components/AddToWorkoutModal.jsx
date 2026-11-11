import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Modal from './Modal.jsx'
import { addExerciseToWorkout, listWorkouts } from '../services/workoutService.js'
import { useToast } from '../context/ToastContext.jsx'

export default function AddToWorkoutModal({ exercise, onClose }) {
  const [workouts, setWorkouts] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const nav = useNavigate()

  useEffect(() => {
    listWorkouts().then(setWorkouts).catch((e) => setError(e.message))
  }, [])

  async function add(w) {
    setBusy(true)
    try {
      await addExerciseToWorkout(w.id, exercise.id)
      toast(`Added to ${w.name}`)
      onClose()
    } catch (e) { toast(e.message, 'error') }
    setBusy(false)
  }

  return (
    <Modal title="Add to workout" onClose={onClose}>
      <p className="mb-3 text-sm text-muted">{exercise.name}</p>
      <button className="btn btn-lime w-full" onClick={() => nav('/workout-builder', { state: { add: exercise.id } })}><Plus size={16} />New workout with this exercise</button>
      <div className="mt-4">
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!error && !workouts && <p className="text-sm text-muted">Loading your workouts…</p>}
        {workouts?.length === 0 && <p className="text-sm text-muted">You have no saved workouts yet.</p>}
        <ul className="divide-y divide-line">
          {workouts?.map((w) => (
            <li key={w.id} className="flex items-center justify-between py-2.5">
              <span className="truncate text-sm">{w.name} <span className="text-xs text-muted">({w.count})</span></span>
              <button className="btn !py-1.5" disabled={busy} onClick={() => add(w)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  )
}
