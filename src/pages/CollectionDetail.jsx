import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2, X } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ExerciseCard from '../components/ExerciseCard.jsx'
import ExercisePicker from '../components/ExercisePicker.jsx'
import NameDialog from '../components/NameDialog.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { getExerciseById } from '../services/exerciseService.js'
import { addToCollection, deleteCollection, getCollection, listCollections, removeFromCollection, renameCollection } from '../services/collectionService.js'

export default function CollectionDetail() {
  const { id } = useParams()
  const { toast } = useToast()
  const nav = useNavigate()
  const [c, setC] = useState(null)
  const [otherNames, setOtherNames] = useState([])
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState(null) // 'rename' | 'delete' | 'picker' | { remove: exercise }
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    Promise.all([getCollection(id), listCollections()])
      .then(([col, all]) => { if (!col) return setError('Collection not found.'); setC(col); setOtherNames(all.filter((x) => x.id !== id).map((x) => x.name)) })
      .catch((e) => setError(e.message))
  }, [id])
  useEffect(load, [load])

  async function run(fn, okMsg, after) {
    setBusy(true)
    try { await fn(); toast(okMsg); setDialog(null); after ? after() : load() } catch (e) { toast(e.message, 'error') }
    setBusy(false)
  }

  if (error) return <div className="py-24 text-center"><p className="text-sm text-red-400">{error}</p><Link to="/collections" className="btn mt-4">Back to collections</Link></div>
  if (!c) return <p className="py-24 text-center text-sm text-muted">Loading collection…</p>
  const exercises = c.codes.map(getExerciseById).filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/collections" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"><ArrowLeft size={16} />All collections</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold uppercase">{c.name}</h1>
          <p className="text-xs text-muted">{exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-lime" onClick={() => setDialog('picker')}><Plus size={16} />Add exercises</button>
          <button className="btn" onClick={() => setDialog('rename')} aria-label="Rename collection"><Pencil size={14} /></button>
          <button className="btn" onClick={() => setDialog('delete')} aria-label="Delete collection"><Trash2 size={14} /></button>
        </div>
      </div>

      {exercises.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="font-medium">This collection is empty</p>
          <p className="mt-1 text-sm text-muted">Add exercises here, or use “Save to collection” on any exercise page.</p>
          <Link to="/exercises" className="btn mt-4">Browse exercises</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {exercises.map((e) => (
            <div key={e.id} className="flex items-stretch gap-2">
              <div className="min-w-0 flex-1"><ExerciseCard exercise={e} /></div>
              <button className="btn !px-3" onClick={() => setDialog({ remove: e })} aria-label={`Remove ${e.name} from collection`}><X size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {dialog === 'rename' && <NameDialog title="Rename collection" initial={c.name} confirmLabel="Save" others={otherNames} busy={busy} onSubmit={(n) => run(() => renameCollection(id, n), 'Collection renamed.')} onCancel={() => setDialog(null)} />}
      {dialog === 'delete' && <ConfirmDialog title="Delete collection?" message={`“${c.name}” will be deleted. The exercises themselves stay in the library.`} busy={busy} onConfirm={() => run(() => deleteCollection(id), 'Collection deleted.', () => nav('/collections', { replace: true }))} onCancel={() => setDialog(null)} />}
      {dialog?.remove && <ConfirmDialog title="Remove exercise?" message={`Remove “${dialog.remove.name}” from this collection?`} confirmLabel="Remove" busy={busy} onConfirm={() => run(() => removeFromCollection(id, dialog.remove.id), 'Exercise removed.')} onCancel={() => setDialog(null)} />}
      {dialog === 'picker' && <ExercisePicker unique addedCodes={c.codes} onAdd={(code) => addToCollection(id, code).then(load).catch((e) => toast(e.message, 'error'))} onClose={() => setDialog(null)} />}
    </div>
  )
}
