import { useState } from 'react'
import Modal from './Modal.jsx'
import { validateCollectionName } from '../utils/collectionValidation.js'

export default function NameDialog({ title, initial = '', confirmLabel, others, busy, onSubmit, onCancel }) {
  const [name, setName] = useState(initial)
  const [error, setError] = useState('')
  function submit(e) {
    e.preventDefault()
    const err = validateCollectionName(name, others)
    setError(err)
    if (!err) onSubmit(name.trim())
  }
  return (
    <Modal title={title} onClose={onCancel}>
      <form onSubmit={submit}>
        <label className="block text-sm text-muted">Collection name
          <input autoFocus value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home Workout" className={`mt-1 w-full rounded-lg border bg-ink px-3 py-2.5 text-fg outline-none focus:border-muted ${error ? 'border-red-500' : 'border-line'}`} />
          {error && <span className="text-xs text-red-400">{error}</span>}
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-lime" disabled={busy}>{busy ? 'Saving…' : confirmLabel}</button>
        </div>
      </form>
    </Modal>
  )
}
