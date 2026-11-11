import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthShell, { Field, isEmail } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Signup() {
  const { user, signUp } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  if (user) return <Navigate to="/exercises" replace />
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  async function submit(ev) {
    ev.preventDefault()
    const errs = {}
    if (f.name.trim().length < 2) errs.name = 'Enter a name (at least 2 characters).'
    if (!isEmail(f.email)) errs.email = 'Enter a valid email address.'
    if (f.password.length < 8) errs.password = 'Use at least 8 characters.'
    if (f.confirm !== f.password) errs.confirm = 'Passwords do not match.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    const { error, needsConfirmation } = await signUp(f.email.trim(), f.password, f.name.trim())
    setBusy(false)
    if (error) return toast(error.message, 'error')
    if (needsConfirmation) return setSent(true)
    toast('Account created!')
    nav('/exercises', { replace: true })
  }

  if (sent) return (
    <AuthShell title="Check your email" subtitle={`We sent a confirmation link to ${f.email}. Open it, then log in.`}>
      <Link to="/login" className="btn btn-lime w-full">Go to login</Link>
    </AuthShell>
  )
  return (
    <AuthShell title="Sign up" subtitle="Free account. Your data stays private to you.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Display name" value={f.name} onChange={set('name')} error={errors.name} />
        <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
        <Field label="Password" type="password" autoComplete="new-password" value={f.password} onChange={set('password')} error={errors.password} />
        <Field label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} error={errors.confirm} />
        <button className="btn btn-lime w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="text-xs text-muted">Already registered? <Link to="/login" className="text-lime hover:underline">Log in</Link></p>
    </AuthShell>
  )
}
