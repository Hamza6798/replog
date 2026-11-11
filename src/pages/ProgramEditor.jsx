import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import ExercisePicker from '../components/ExercisePicker.jsx'
import NumField from '../components/NumField.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { buildFromTemplate, newProgramDay, newProgramItem } from '../data/programTemplates.js'
import { getExerciseById } from '../services/exerciseService.js'
import { getProgram, saveProgram } from '../services/programService.js'
import { validateProgram, WEEKDAYS } from '../utils/programValidation.js'

export default function ProgramEditor() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [state, setState] = useState(() => {
    const t = !id && params.get('template') ? buildFromTemplate(params.get('template')) : null
    return t || { name: '', description: '', template: null, days: [] }
  })
  const [errors, setErrors] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [pickerDay, setPickerDay] = useState(null)

  useEffect(() => {
    if (!id) return
    getProgram(id).then((p) => (p ? setState(p) : setLoadError('Program not found.'))).catch((e) => setLoadError(e.message)).finally(() => setLoading(false))
  }, [id])

  const setDay = (key, fn) => setState((s) => ({ ...s, days: s.days.map((d) => (d.key === key ? fn(d) : d)) }))
  const setItem = (dk, ik, field, v) => setDay(dk, (d) => ({ ...d, items: d.items.map((i) => (i.key === ik ? { ...i, [field]: v } : i)) }))
  const moveItem = (dk, idx, dir) => setDay(dk, (d) => { const n = [...d.items]; const j = idx + dir; if (j < 0 || j >= n.length) return d; [n[idx], n[j]] = [n[j], n[idx]]; return { ...d, items: n } })
  const addDay = () => setState((s) => {
    const used = s.days.map((d) => d.weekday)
    const free = WEEKDAYS.findIndex((_, i) => !used.includes(String(i)))
    return { ...s, days: [...s.days, newProgramDay(`Day ${s.days.length + 1}`, free === -1 ? '' : free)] }
  })

  async function save() {
    const v = validateProgram(state)
    setErrors(v)
    if (!v.ok) return toast(v.general || 'Fix the highlighted fields.', 'error')
    setSaving(true)
    try {
      await saveProgram(user.id, { id, ...state })
      toast(id ? 'Program updated.' : 'Program saved.')
      nav('/programs')
    } catch (e) { toast(e.message, 'error') }
    setSaving(false)
  }

  if (loading) return <p className="py-24 text-center text-sm text-muted">Loading program…</p>
  if (loadError) return <p className="py-24 text-center text-sm text-red-400">{loadError}</p>
  const pickerItems = state.days.find((d) => d.key === pickerDay)?.items ?? []

  return (
    <div className="mx-auto max-w-3xl pb-24">
      <h1 className="font-display text-4xl font-bold uppercase">{id ? 'Edit program' : 'New program'}</h1>
      <label className="mt-4 block text-sm text-muted">Program name
        <input value={state.name} maxLength={100} onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))} className={`mt-1 w-full rounded-lg border bg-card px-3 py-2.5 text-fg outline-none focus:border-muted ${errors?.name ? 'border-red-500' : 'border-line'}`} />
        {errors?.name && <span className="text-xs text-red-400">{errors.name}</span>}
      </label>
      <label className="mt-3 block text-sm text-muted">Description (optional)
        <textarea value={state.description} rows={2} maxLength={500} onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-line bg-card px-3 py-2 text-fg outline-none focus:border-muted" />
      </label>

      <div className="mt-5" aria-label="Weekly schedule">
        <p className="mb-1 text-xs uppercase tracking-wider text-muted">Weekly schedule · {state.days.length} training {state.days.length === 1 ? 'day' : 'days'}</p>
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w, i) => {
            const d = state.days.find((x) => x.weekday === String(i))
            return (
              <div key={w} className={`rounded-lg border p-1.5 text-center ${d ? 'border-lime' : 'border-line'}`}>
                <p className="text-[10px] text-muted">{w}</p>
                <p className="truncate text-[11px] font-medium">{d ? d.name : 'Rest'}</p>
              </div>
            )
          })}
        </div>
        {state.days.some((d) => d.weekday === '') && <p className="mt-1 text-xs text-muted">Days without a weekday are not shown on the schedule.</p>}
      </div>

      <div className="mt-6 space-y-5">
        {state.days.map((d, di) => {
          const de = errors?.days?.[d.key] || { items: {} }
          return (
            <section key={d.key} className="rounded-xl border border-line bg-card p-4">
              <div className="flex flex-wrap items-start gap-3">
                <label className="min-w-[10rem] flex-1 text-xs text-muted">Day name
                  <input value={d.name} maxLength={60} onChange={(e) => setDay(d.key, (x) => ({ ...x, name: e.target.value }))} className={`mt-1 w-full rounded-lg border bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-muted ${de.name ? 'border-red-500' : 'border-line'}`} />
                  {de.name && <span className="text-red-400">{de.name}</span>}
                </label>
                <label className="text-xs text-muted">Weekday
                  <select value={d.weekday} onChange={(e) => setDay(d.key, (x) => ({ ...x, weekday: e.target.value }))} className={`mt-1 block rounded-lg border bg-ink px-2 py-2 text-sm text-fg ${de.weekday ? 'border-red-500' : 'border-line'}`}>
                    <option value="">Unscheduled</option>
                    {WEEKDAYS.map((w, i) => <option key={w} value={i}>{w}</option>)}
                  </select>
                  {de.weekday && <span className="block max-w-[10rem] text-red-400">{de.weekday}</span>}
                </label>
                <button className="btn mt-5 !p-2" onClick={() => setState((s) => ({ ...s, days: s.days.filter((x) => x.key !== d.key) }))} aria-label={`Remove ${d.name}`}><Trash2 size={14} /></button>
              </div>

              <div className="mt-3 space-y-2">
                {d.items.map((it, idx) => {
                  const ex = getExerciseById(it.code)
                  const e = de.items[it.key] || {}
                  return (
                    <div key={it.key} className="rounded-lg border border-line bg-ink p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-sm font-medium"><span className="mr-2 font-mono text-xs text-muted">{idx + 1}</span>{ex?.name ?? 'Unknown exercise'}</p>
                        <div className="flex shrink-0 gap-1">
                          <button className="btn !p-1.5" onClick={() => moveItem(d.key, idx, -1)} disabled={idx === 0} aria-label="Move up"><ArrowUp size={12} /></button>
                          <button className="btn !p-1.5" onClick={() => moveItem(d.key, idx, 1)} disabled={idx === d.items.length - 1} aria-label="Move down"><ArrowDown size={12} /></button>
                          <button className="btn !p-1.5" onClick={() => setDay(d.key, (x) => ({ ...x, items: x.items.filter((i) => i.key !== it.key) }))} aria-label={`Remove ${ex?.name}`}><Trash2 size={12} /></button>
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <NumField label="Sets" inputMode="numeric" value={it.sets} onChange={(v) => setItem(d.key, it.key, 'sets', v)} error={e.sets} />
                        <NumField label="Reps" value={it.reps} onChange={(v) => setItem(d.key, it.key, 'reps', v)} error={e.reps} />
                        <NumField label="Rest" suffix="sec" inputMode="numeric" value={it.rest} onChange={(v) => setItem(d.key, it.key, 'rest', v)} error={e.rest} />
                      </div>
                      <input value={it.notes} maxLength={200} placeholder="Notes (optional)" onChange={(ev) => setItem(d.key, it.key, 'notes', ev.target.value)} className="mt-2 w-full rounded-lg border border-line bg-card px-3 py-1.5 text-xs outline-none focus:border-muted" aria-label="Exercise notes" />
                    </div>
                  )
                })}
                {de.empty && <p className="text-xs text-red-400">{de.empty}</p>}
                <button className="btn w-full" onClick={() => setPickerDay(d.key)}><Plus size={14} />Add exercise to {d.name || `day ${di + 1}`}</button>
              </div>
            </section>
          )
        })}
        {errors?.general && <p className="text-sm text-red-400">{errors.general}</p>}
        {state.days.length < 7 && <button className="btn w-full" onClick={addDay}><Plus size={16} />Add training day</button>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-panel/95 px-4 py-3 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="text-sm text-muted">{state.days.length} {state.days.length === 1 ? 'day' : 'days'} · {state.days.reduce((n, d) => n + d.items.length, 0)} exercises</p>
          <div className="flex gap-2">
            <button className="btn" onClick={() => nav('/programs')} disabled={saving}>Cancel</button>
            <button className="btn btn-lime" onClick={save} disabled={saving}>{saving ? 'Saving…' : id ? 'Save changes' : 'Save program'}</button>
          </div>
        </div>
      </div>
      {pickerDay && <ExercisePicker addedCodes={pickerItems.map((i) => i.code)} onAdd={(code) => setDay(pickerDay, (d) => ({ ...d, items: [...d.items, newProgramItem(code)] }))} onClose={() => setPickerDay(null)} />}
    </div>
  )
}
