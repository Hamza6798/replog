import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell, { Field, isEmail } from '../components/AuthShell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(ev) {
    ev.preventDefault()
    if (!isEmail(email)) return setError('Enter a valid email address.')
    setError(''); setBusy(true)
    const { error: err } = await sendPasswordReset(email.trim())
    setBusy(false)
    if (err) return toast(err.message, 'error')
    setSent(true)
  }
  return (
    <AuthShell title="Reset password" subtitle={sent ? 'If that email has an account, a reset link is on its way.' : 'We will email you a reset link.'}>
      {!sent && (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <button className="btn btn-lime w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <Link to="/login" className="text-xs text-muted hover:text-fg">Back to login</Link>
    </AuthShell>
  )
}
