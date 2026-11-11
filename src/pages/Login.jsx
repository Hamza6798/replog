import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthShell, { Field, isEmail } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function Login() {
  const { user, signIn } = useAuth()
  const { toast } = useToast()
  const nav = useNavigate()
  const from = useLocation().state?.from || '/exercises'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  if (user) return <Navigate to={from} replace />

  async function submit(ev) {
    ev.preventDefault()
    const errs = {}
    if (!isEmail(email)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Enter your password.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setBusy(true)
    const { error } = await signIn(email.trim(), password)
    setBusy(false)
    if (error) return toast(error.message, 'error')
    toast('Welcome back!')
    nav(from, { replace: true })
  }
  return (
    <AuthShell title="Log in" subtitle="Log in to save workouts, programs and collections.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <button className="btn btn-lime w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <div className="flex justify-between text-xs text-muted">
        <Link to="/forgot-password" className="hover:text-fg">Forgot password?</Link>
        <Link to="/signup" className="hover:text-fg">Create an account</Link>
      </div>
    </AuthShell>
  )
}
