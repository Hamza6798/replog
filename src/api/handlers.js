// REPLOG read-only exercise API. Pure functions: no framework, so the same code
// serves the Vite dev server, `vite preview`, and Vercel serverless functions.
import { exercises, CATEGORIES, EQUIPMENT, DIFFICULTIES, MUSCLES } from '../data/exercises.js'
import { queryExercises, getExerciseById, getRelatedExercises } from '../services/exerciseService.js'

export const SORTS = ['name-asc', 'name-desc', 'diff-asc', 'diff-desc']
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }

const reply = (status, body, extra = {}) => ({
  status, body,
  headers: { ...CORS, 'Cache-Control': status === 200 ? 'public, max-age=60, s-maxage=3600' : 'no-store', ...extra },
})
const fail = (status, code, message, extra) => reply(status, { error: { code, message } }, extra)

const summary = (e) => ({
  id: e.id, name: e.name, category: e.category, primaryMuscle: e.primaryMuscle, secondaryMuscles: e.secondaryMuscles,
  equipment: e.equipment, difficulty: e.difficulty, type: e.type, imageUrl: e.imageUrl,
})
const full = (e) => ({ ...summary(e), images: e.images, instructions: e.instructions, mistakes: e.mistakes })

// Case-insensitive match against the allowed values; returns the canonical value.
function option(value, allowed, name) {
  if (value == null || value === '') return { value: null }
  const hit = allowed.find((a) => a.toLowerCase() === value.trim().toLowerCase())
  return hit ? { value: hit } : { error: `Invalid ${name} "${value}". Allowed values: ${allowed.join(', ')}.` }
}

function integer(value, name, { min, max, fallback }) {
  if (value == null || value === '') return { value: fallback }
  if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) return { error: `${name} must be a whole number from ${min} to ${max}.` }
  return { value: Number(value) }
}

function listExercises(params) {
  const checks = {
    category: option(params.get('category'), CATEGORIES, 'category'),
    muscle: option(params.get('muscle'), MUSCLES, 'muscle'),
    equipment: option(params.get('equipment'), EQUIPMENT, 'equipment'),
    difficulty: option(params.get('difficulty'), DIFFICULTIES, 'difficulty'),
    sort: option(params.get('sort'), SORTS, 'sort'),
    limit: integer(params.get('limit'), 'limit', { min: 1, max: 100, fallback: 20 }),
    offset: integer(params.get('offset'), 'offset', { min: 0, max: 100000, fallback: 0 }),
  }
  const bad = Object.values(checks).find((c) => c.error)
  if (bad) return fail(400, 'INVALID_PARAMETER', bad.error)
  const q = (params.get('q') || '').trim()
  if (q.length > 100) return fail(400, 'INVALID_PARAMETER', 'q must be 100 characters or fewer.')

  const all = queryExercises({ search: q, category: checks.category.value, muscle: checks.muscle.value, equipment: checks.equipment.value, difficulty: checks.difficulty.value, sort: checks.sort.value || 'name-asc' })
  const { limit, offset } = { limit: checks.limit.value, offset: checks.offset.value }
  return reply(200, { data: all.slice(offset, offset + limit).map(summary), meta: { total: all.length, limit, offset } })
}

export function handleApi(method, pathname, params = new URLSearchParams()) {
  if (method === 'OPTIONS') return { status: 204, body: null, headers: CORS }
  if (method !== 'GET') return fail(405, 'METHOD_NOT_ALLOWED', 'This API is read-only. Use GET.', { Allow: 'GET, OPTIONS' })
  const path = pathname.replace(/\/+$/, '')

  if (path === '/api/exercises') return listExercises(params)
  if (path === '/api/meta') return reply(200, { data: { categories: CATEGORIES, muscles: MUSCLES, equipment: EQUIPMENT, difficulties: DIFFICULTIES, sorts: SORTS, totalExercises: exercises.length } })
  const m = /^\/api\/exercises\/([^/]+)$/.exec(path)
  if (m) {
    const e = getExerciseById(decodeURIComponent(m[1]))
    if (!e) return fail(404, 'NOT_FOUND', `No exercise with id "${m[1]}".`)
    return reply(200, { data: { ...full(e), related: getRelatedExercises(e).map(summary) } })
  }
  return fail(404, 'NOT_FOUND', 'Unknown endpoint. See /api for the documentation.')
}
