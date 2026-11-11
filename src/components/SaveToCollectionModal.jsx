import { useCallback, useEffect, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import Modal from './Modal.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { addToCollection, createCollection, listCollections, removeFromCollection } from '../services/collectionService.js'
import { validateCollectionName } from '../utils/collectionValidation.js'

export default function SaveToCollectionModal({ exercise, onClose }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [collections, setCollections] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState('')

  const load = useCallback(() => listCollections().then(setCollections).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])

  async function toggle(c) {
    const saved = c.codes.includes(exercise.id)
    setBusyId(c.id)
    try {
      if (saved) await removeFromCollection(c.id, exercise.id)
      else await addToCollection(c.id, exercise.id)
      toast(saved ? `Removed from ${c.name}` : `Saved to ${c.name}`)
      await load()
    } catch (e) { toast(e.message, 'error') }
    setBusyId(null)
  }

  async function create(e) {
    e.preventDefault()
    const err = validateCollectionName(name, (collections || []).map((c) => c.name))
    setNameError(err)
    if (err) return
    setBusyId('new')
    try {
      const id = await createCollection(user.id, name)
      await addToCollection(id, exercise.id)
      toast(`Saved to ${name.trim()}`)
      setName('')
      await load()
    } catch (er) { toast(er.message, 'error') }
    setBusyId(null)
  }

  return (
    <Modal title="Save to collection" onClose={onClose}>
      <p className="mb-3 text-sm text-muted">{exercise.name}</p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!error && !collections && <p className="text-sm text-muted">Loading your collections…</p>}
      {collections?.length === 0 && <p className="text-sm text-muted">You have no collections yet. Create your first one below.</p>}
      <ul className="divide-y divide-line">
        {collections?.map((c) => {
          const saved = c.codes.includes(exercise.id)
          return (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="truncate text-sm">{c.name} <span className="text-xs text-muted">({c.codes.length})</span></span>
              <button className={`btn !py-1.5 ${saved ? 'btn-lime' : ''}`} disabled={busyId !== null} onClick={() => toggle(c)} aria-pressed={saved}>
                {saved ? <><Check size={14} />Saved</> : 'Save'}
              </button>
            </li>
          )
        })}
      </ul>
      <form onSubmit={create} className="mt-4 border-t border-line pt-4">
        <label className="block text-xs text-muted">New collection
          <div className="mt-1 flex gap-2">
            <input value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="Collection name" className={`min-w-0 flex-1 rounded-lg border bg-ink px-3 py-2 text-sm text-fg outline-none focus:border-muted ${nameError ? 'border-red-500' : 'border-line'}`} />
            <button className="btn" disabled={busyId !== null}><Plus size={14} />Create & save</button>
          </div>
          {nameError && <span className="text-red-400">{nameError}</span>}
        </label>
      </form>
    </Modal>
  )
}
