import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, ChevronRight, Plus } from 'lucide-react'
import NameDialog from '../components/NameDialog.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { createCollection, listCollections } from '../services/collectionService.js'

export default function Collections() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [collections, setCollections] = useState(null)
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => { setError(''); listCollections().then(setCollections).catch((e) => setError(e.message)) }, [])
  useEffect(load, [load])

  async function create(name) {
    setBusy(true)
    try { await createCollection(user.id, name); toast('Collection created.'); setCreating(false); load() } catch (e) { toast(e.message, 'error') }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl font-bold uppercase">Collections</h1>
        <button className="btn btn-lime" onClick={() => setCreating(true)}><Plus size={16} />New collection</button>
      </div>
      {error && <div className="mt-6 rounded-lg border border-line bg-card p-4 text-sm"><p className="text-red-400">{error}</p><button className="btn mt-3" onClick={load}>Try again</button></div>}
      {!error && !collections && <p className="mt-10 text-center text-sm text-muted">Loading collections…</p>}
      {collections?.length === 0 && (
        <div className="mt-16 flex flex-col items-center text-center">
          <Bookmark size={32} className="mb-3 text-muted" />
          <p className="font-medium">No collections yet</p>
          <p className="mt-1 text-sm text-muted">Group exercises you like, such as “Home Workout” or “Best Back Exercises”.</p>
          <button className="btn btn-lime mt-4" onClick={() => setCreating(true)}>Create a collection</button>
        </div>
      )}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {collections?.map((c) => (
          <Link key={c.id} to={`/collections/${c.id}`} className="group flex items-center justify-between rounded-xl border border-line bg-card p-4 transition hover:border-muted">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold">{c.name}</h2>
              <p className="mt-1 text-xs text-muted">{c.codes.length} {c.codes.length === 1 ? 'exercise' : 'exercises'} • Updated {new Date(c.updatedAt).toLocaleDateString()}</p>
            </div>
            <ChevronRight size={16} className="text-muted transition group-hover:text-lime" />
          </Link>
        ))}
      </div>
      {creating && <NameDialog title="New collection" confirmLabel="Create" others={(collections || []).map((c) => c.name)} busy={busy} onSubmit={create} onCancel={() => setCreating(false)} />}
    </div>
  )
}
