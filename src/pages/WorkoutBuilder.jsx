import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Clock, Plus, Trash2 } from 'lucide-react'
import ExercisePicker from '../components/ExercisePicker.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getExerciseById } from '../services/exerciseService.js'
import { getWorkout, saveWorkout } from '../services/workoutService.js'
import { estimateMinutes, newItem, validateWorkout } from '../utils/workoutValidation.js'

function Num({ label, value, onChange, error, suffix, ...rest }) {
  return (
    <label className="text-xs text-muted">
      {label}{suffix && <span className="opacity-70"> ({suffix})</span>}
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={`mt-1 w-full rounded-lg border bg-ink px-2.5 py-2 text-sm text-fg outline-none focus:border-muted ${error ? 'border-red-500' : 'border-line'}`} />
      {error && <span className="text-red-400">{error}</span>}
    </label>
  )
}

export default function WorkoutBuilder() {
  const { id } = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const prefill = useLocation().state?.add
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState(() => (!id && prefill && getExerciseById(prefill) ? [newItem(prefill)] : []))
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [picker, setPicker] = useState(false)

  useEffect(() => {
    if (!id) return
    getWorkout(id)
      .then((w) => { if (!w) return setLoadError('Workout not found.'); setName(w.name); setNotes(w.notes); setItems(w.items) })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const update = (key, field, value) => setItems((l) => l.map((i) => (i.key === key ? { ...i, [field]: value } : i)))
  const move = (idx, dir) => setItems((l) => { const n = [...l]; const j = idx + dir; if (j < 0 || j >= n.length) return l; [n[idx], n[j]] = [n[j], n[idx]]; return n })
  const remove = (key) => setItems((l) => l.filter((i) => i.key !== key))

  async function save() {
    const v = validateWorkout({ name, notes, items })
    setErrors(v)
    if (!v.ok) return toast(v.general || 'Fix the highlighted fields.', 'error')
    setSaving(true)
    try {
      await saveWorkout(user.id, { id, name, notes, items })
      toast(id ? 'Workout updated.' : 'Workout saved.')
      nav('/workouts')
    } catch (e) { toast(e.message, 'error') }
    setSaving(false)
  }

  if (loading) return <p className="py-24 text-center text-sm text-muted">Loading workout…</p>
  if (loadError) return <p className="py-24 text-center text-sm text-red-400">{loadError}</p>
  const minutes = estimateMinutes(items)

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <h1 className="font-display text-4xl font-bold uppercase">{id ? 'Edit workout' : 'New workout'}</h1>
      <label className="mt-4 block text-sm text-muted">Workout name
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="e.g. Push Day" className={`mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-fg outline-none focus:border-muted ${errors?.name ? 'border-red-500' : 'border-line'}`} />
        {errors?.name && <span className="text-xs text-red-400">{errors.name}</span>}
      </label>
      <label className="mt-3 block text-sm text-muted">Notes (optional)
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-fg outline-none focus:border-muted" />
      </label>

      <div className="mt-6 space-y-3">
        {items.map((it, idx) => {
          const ex = getExerciseById(it.code)
          const e = errors?.items?.[it.key] || {}
          return (
            <div key={it.key} className="rounded-xl border border-line bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold"><span className="mr-2 font-mono text-xs text-muted">{idx + 1}</span>{ex?.name ?? 'Unknown exercise'}</p>
                  <p className="text-xs text-muted">{ex?.primaryMuscle} • {ex?.equipment}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button className="btn !p-2" onClick={() => move(idx, -1)} disabled={idx === 0} aria-label="Move up"><ArrowUp size={14} /></button>
                  <button className="btn !p-2" onClick={() => move(idx, 1)} disabled={idx === items.length - 1} aria-label="Move down"><ArrowDown size={14} /></button>
                  <button className="btn !p-2" onClick={() => remove(it.key)} aria-label={`Remove ${ex?.name}`}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Num label="Sets" inputMode="numeric" value={it.sets} onChange={(v) => update(it.key, 'sets', v)} error={e.sets} />
                <Num label="Reps" value={it.reps} onChange={(v) => update(it.key, 'reps', v)} error={e.reps} />
                <Num label="Weight" suffix="kg, optional" inputMode="decimal" value={it.weight} onChange={(v) => update(it.key, 'weight', v)} error={e.weight} />
                <Num label="Rest" suffix="sec" inputMode="numeric" value={it.rest} onChange={(v) => update(it.key, 'rest', v)} error={e.rest} />
              </div>
              <input value={it.notes} onChange={(ev) => update(it.key, 'notes', ev.target.value)} placeholder="Exercise notes (optional)" maxLength={200} className="mt-3 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm outline-none focus:border-muted" aria-label="Exercise notes" />
              {e.notes && <span className="text-xs text-red-400">{e.notes}</span>}
            </div>
          )
        })}
        {items.length === 0 && <p className={`rounded-xl border border-dashed py-10 text-center text-sm ${errors?.general ? 'border-red-500 text-red-400' : 'border-line text-muted'}`}>No exercises yet. Add some from the library.</p>}
        <button className="btn w-full" onClick={() => setPicker(true)}><Plus size={16} />Add exercise</button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 px-4 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="flex items-center gap-3 text-sm text-muted">
            <span>{items.length} {items.length === 1 ? 'exercise' : 'exercises'}</span>
            <span className="flex items-center gap-1"><Clock size={14} />~{minutes} min</span>
          </p>
          <div className="flex gap-2">
            <button className="btn" onClick={() => nav('/workouts')} disabled={saving}>Cancel</button>
            <button className="btn btn-lime" onClick={save} disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Save workout'}</button>
          </div>
        </div>
      </div>
      {picker && <ExercisePicker addedCodes={items.map((i) => i.code)} onAdd={(code) => setItems((l) => [...l, newItem(code)])} onClose={() => setPicker(false)} />}
    </div>
  )
}
