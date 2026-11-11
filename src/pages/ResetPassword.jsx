import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell, { Field } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function ResetPassword() {
  const { user, loading, updatePassword } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) return <p className="py-24 text-center text-sm text-muted">Loading…</p>
  if (!user) return (
    <AuthShell title="Reset password" subtitle="Open the reset link from your email to set a new password.">
      <Link to="/forgot-password" className="btn w-full">Request a new link</Link>
    </AuthShell>
  )
  async function submit(ev) {
    ev.preventDefault()
    if (pw.length < 8) return setError('Use at least 8 characters.')
    if (pw !== confirm) return setError('Passwords do not match.')
    setError(''); setBusy(true)
    const { error: err } = await updatePassword(pw)
    setBusy(false)
    if (err) return toast(err.message, 'error')
    toast('Password updated.')
    nav('/exercises', { replace: true })
  }
  return (
    <AuthShell title="New password">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="New password" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Field label="Confirm password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error} />
        <button className="btn btn-lime w-full" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
      </form>
    </AuthShell>
  )
}
