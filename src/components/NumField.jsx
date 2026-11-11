export default function NumField({ label, value, onChange, error, suffix, ...rest }) {
  return (
    <label className="text-xs text-muted">
      {label}{suffix && <span className="opacity-70"> ({suffix})</span>}
      <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={`mt-1 w-full rounded-lg border bg-ink px-2.5 py-2 text-sm text-fg outline-none focus:border-muted ${error ? 'border-red-500' : 'border-line'}`} />
      {error && <span className="text-red-400">{error}</span>}
    </label>
  )
}
