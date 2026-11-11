import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { deleteProgram, duplicateProgram, listPrograms } from '../services/programService.js'

export default function Programs() {
  const { user } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [programs, setPrograms] = useState(null)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => { setError(''); listPrograms().then(setPrograms).catch((e) => setError(e.message)) }, [])
  useEffect(load, [load])

  async function copy(p) { try { await duplicateProgram(user.id, p.id); toast('Program duplicated.'); load() } catch (e) { toast(e.message, 'error') } }
  async function remove() {
    setBusy(true)
    try { await deleteProgram(toDelete.id); toast('Program deleted.'); setToDelete(null); load() } catch (e) { toast(e.message, 'error') }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold uppercase">Programs</h1>
        <Link to="/program-generator" className="btn btn-lime"><Plus size={16} />New program</Link>
      </div>
      {error && <div className="mt-6 rounded-lg border border-line bg-card p-4 text-sm"><p className="text-red-400">{error}</p><button className="btn mt-3" onClick={load}>Try again</button></div>}
      {!error && !programs && <p className="mt-10 text-center text-sm text-muted">Loading programs…</p>}
      {programs?.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <CalendarDays size={32} className="mb-3 text-muted" />
          <p className="font-medium">No programs yet</p>
          <p className="mt-1 text-sm text-muted">Start from a template and make it your own.</p>
          <Link to="/program-generator" className="btn btn-lime mt-4">Open the generator</Link>
        </div>
      )}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {programs?.map((p) => (
          <article key={p.id} className="flex flex-col justify-between rounded-xl border border-line bg-card p-4">
            <div>
              <h2 className="truncate text-lg font-semibold">{p.name}</h2>
              <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted">
                <span>{p.days} training {p.days === 1 ? 'day' : 'days'}</span>
                <span>{p.exercises} exercises</span>
                <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
              </p>
              {p.description && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.description}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn flex-1" onClick={() => nav(`/programs/${p.id}`)}><Pencil size={14} />Edit</button>
              <button className="btn" onClick={() => copy(p)} aria-label={`Duplicate ${p.name}`}><Copy size={14} /></button>
              <button className="btn" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
      </div>
      {toDelete && <ConfirmDialog title="Delete program?" message={`“${toDelete.name}”, all its days and exercises will be permanently deleted.`} busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)} />}
    </div>
  )
}
