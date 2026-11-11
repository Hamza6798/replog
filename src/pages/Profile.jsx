import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthShell, { Field } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [name, setName] = useState(null)
  const [busy, setBusy] = useState(false)
  const value = name ?? profile?.display_name ?? ''

  async function save(ev) {
    ev.preventDefault()
    if (value.trim().length < 2) return toast('Name must be at least 2 characters.', 'error')
    setBusy(true)
    const { error } = await updateProfile({ display_name: value.trim() })
    setBusy(false)
    toast(error ? error.message : 'Profile saved.', error ? 'error' : 'success')
  }
  async function logout() {
    await signOut()
    toast('Logged out.')
    nav('/exercises', { replace: true })
  }
  return (
    <AuthShell title="Profile" subtitle={user.email}>
      <form onSubmit={save} className="space-y-4">
        <Field label="Display name" value={value} onChange={(e) => setName(e.target.value)} />
        <button className="btn btn-lime w-full" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
      </form>
      <button onClick={logout} className="btn w-full">Log out</button>
    </AuthShell>
  )
}
