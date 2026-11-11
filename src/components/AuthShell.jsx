import { AlertTriangle } from 'lucide-react'
import { isSupabaseConfigured } from '../lib/supabase.js'

export function Field({ label, error, ...props }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      <input {...props} className="w-full rounded-lg border border-line bg-ink px-3 py-2.5 outline-none focus:border-muted" />
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  )
}

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="font-display text-4xl font-bold uppercase">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      {!isSupabaseConfigured && (
        <div className="mt-4 flex gap-2 rounded-lg border border-line bg-card p-3 text-xs text-muted">
          <AlertTriangle size={16} className="shrink-0 text-lime" />
          <span>Accounts are not set up yet. Create a <code className="font-mono">.env</code> file with your Supabase URL and anon key, then restart <code className="font-mono">npm run dev</code>.</span>
        </div>
      )}
      <div className="mt-6 space-y-4 rounded-xl border border-line bg-card p-5">{children}</div>
    </div>
  )
}

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
