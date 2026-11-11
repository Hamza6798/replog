// Returns an error message, or '' when the name is fine.
// `others` = names of the user's other collections (case-insensitive duplicate check).
export function validateCollectionName(name, others = []) {
  const n = name.trim()
  if (n.length < 1) return 'Enter a name.'
  if (n.length > 100) return 'Max 100 characters.'
  if (others.some((o) => o.trim().toLowerCase() === n.toLowerCase())) return 'You already have a collection with that name.'
  return ''
}
