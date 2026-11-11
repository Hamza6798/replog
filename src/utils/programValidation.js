import { validateItem } from './workoutValidation.js'

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function validateProgram({ name, description = '', days }) {
  const errors = { days: {} }
  if (name.trim().length < 1 || name.trim().length > 100) errors.name = 'Enter a name (1 to 100 characters).'
  if (description.length > 500) errors.description = 'Max 500 characters.'
  if (days.length < 1) errors.general = 'Add at least one training day.'
  if (days.length > 7) errors.general = 'A week has at most 7 training days.'
  const seen = {}
  days.forEach((d) => {
    const e = { items: {} }
    if (d.name.trim().length < 1 || d.name.trim().length > 60) e.name = 'Name this day (1 to 60 characters).'
    if (d.weekday !== '') { if (seen[d.weekday]) e.weekday = 'Another day already uses this weekday.'; seen[d.weekday] = true }
    if (d.items.length === 0) e.empty = 'Add at least one exercise.'
    d.items.forEach((i) => { const ie = validateItem(i); if (Object.keys(ie).length) e.items[i.key] = ie })
    if (e.name || e.weekday || e.empty || Object.keys(e.items).length) errors.days[d.key] = e
  })
  errors.ok = !errors.name && !errors.description && !errors.general && Object.keys(errors.days).length === 0
  return errors
}
