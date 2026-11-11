// Pure helpers for the workout builder (no React, easy to test).
export const SECONDS_PER_SET = 45 // rough time under tension + setup, used only for the estimate

export function estimateMinutes(items) {
  const secs = items.reduce((t, i) => t + (Number(i.sets) || 0) * (SECONDS_PER_SET + (Number(i.rest) || 0)), 0)
  return secs === 0 ? 0 : Math.max(1, Math.round(secs / 60))
}

export function validateItem(i) {
  const e = {}
  const sets = Number(i.sets)
  if (!/^\d+$/.test(String(i.sets)) || sets < 1 || sets > 20) e.sets = '1 to 20'
  const m = /^(\d{1,3})(?:-(\d{1,3}))?$/.exec(String(i.reps).trim())
  if (!m || Number(m[1]) < 1 || (m[2] && Number(m[2]) < Number(m[1]))) e.reps = 'e.g. 10 or 8-12'
  if (i.weight !== '' && (!/^\d+(\.\d{1,2})?$/.test(String(i.weight)) || Number(i.weight) > 1000)) e.weight = '0 to 1000'
  const rest = Number(i.rest)
  if (!/^\d+$/.test(String(i.rest)) || rest > 900) e.rest = '0 to 900'
  if ((i.notes || '').length > 200) e.notes = 'Max 200 characters'
  return e
}

export function validateWorkout({ name, notes = '', items }) {
  const errors = { items: {} }
  const n = name.trim()
  if (n.length < 1 || n.length > 100) errors.name = 'Enter a name (1 to 100 characters).'
  if (notes.length > 500) errors.notes = 'Max 500 characters.'
  if (items.length === 0) errors.general = 'Add at least one exercise.'
  items.forEach((i) => { const e = validateItem(i); if (Object.keys(e).length) errors.items[i.key] = e })
  errors.ok = !errors.name && !errors.notes && !errors.general && Object.keys(errors.items).length === 0
  return errors
}

export const newItem = (code) => ({ key: crypto.randomUUID(), rowId: null, code, sets: '3', reps: '8-12', weight: '', rest: '60', notes: '' })
