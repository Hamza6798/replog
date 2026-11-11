import { supabase } from '../lib/supabase.js'
import { estimateMinutes } from '../utils/workoutValidation.js'

let uuidMap = null
// The app shows exercises with codes like "0001"; the database links them by UUID.
export async function exerciseUuids() {
  if (uuidMap) return uuidMap
  const { data, error } = await supabase.from('exercises').select('id,code')
  if (error) throw error
  if (!data.length) throw new Error('The exercise library is empty in the database. Run supabase/seed.sql in the SQL Editor.')
  uuidMap = Object.fromEntries(data.map((r) => [r.code, r.id]))
  return uuidMap
}

export async function listWorkouts() {
  const { data, error } = await supabase
    .from('workouts')
    .select('id,name,notes,updated_at,workout_exercises(sets,rest_seconds)')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map((w) => ({
    id: w.id, name: w.name, notes: w.notes, updatedAt: w.updated_at,
    count: w.workout_exercises.length,
    minutes: estimateMinutes(w.workout_exercises.map((x) => ({ sets: x.sets, rest: x.rest_seconds }))),
  }))
}

export async function getWorkout(id) {
  const { data, error } = await supabase
    .from('workouts')
    .select('id,name,notes,workout_exercises(id,position,sets,reps,target_weight,rest_seconds,notes,exercises(code))')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const items = [...data.workout_exercises]
    .sort((a, b) => a.position - b.position)
    .filter((r) => r.exercises)
    .map((r) => ({
      key: r.id, rowId: r.id, code: r.exercises.code,
      sets: String(r.sets), reps: r.reps, weight: r.target_weight == null ? '' : String(r.target_weight),
      rest: String(r.rest_seconds), notes: r.notes || '',
    }))
  return { id: data.id, name: data.name, notes: data.notes || '', items }
}

// Existing rows are updated in place (upsert) and removed rows are deleted afterwards,
// so a failure part-way never loses exercises that were already saved.
export async function saveWorkout(userId, { id, name, notes, items }) {
  const uuids = await exerciseUuids()
  let workoutId = id
  if (id) {
    const { error } = await supabase.from('workouts').update({ name: name.trim(), notes: notes.trim() || null }).eq('id', id)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from('workouts').insert({ user_id: userId, name: name.trim(), notes: notes.trim() || null }).select('id').single()
    if (error) throw error
    workoutId = data.id
  }
  const rows = items.map((it, i) => ({
    id: it.rowId || crypto.randomUUID(),
    workout_id: workoutId,
    exercise_id: uuids[it.code],
    position: i,
    sets: Number(it.sets),
    reps: String(it.reps).trim(),
    target_weight: it.weight === '' ? null : Number(it.weight),
    rest_seconds: Number(it.rest),
    notes: it.notes?.trim() || null,
  }))
  try {
    const up = await supabase.from('workout_exercises').upsert(rows)
    if (up.error) throw up.error
    const del = await supabase.from('workout_exercises').delete().eq('workout_id', workoutId).not('id', 'in', `(${rows.map((r) => r.id).join(',')})`)
    if (del.error) throw del.error
  } catch (err) {
    if (!id) await supabase.from('workouts').delete().eq('id', workoutId) // don't leave an empty new workout behind
    throw err
  }
  return workoutId
}

export async function duplicateWorkout(userId, id) {
  const w = await getWorkout(id)
  if (!w) throw new Error('Workout not found.')
  return saveWorkout(userId, { name: `${w.name} (copy)`.slice(0, 100), notes: w.notes, items: w.items.map((i) => ({ ...i, rowId: null })) })
}

export async function deleteWorkout(id) {
  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) throw error
}

export async function addExerciseToWorkout(workoutId, code) {
  const uuids = await exerciseUuids()
  const { data, error } = await supabase.from('workout_exercises').select('position').eq('workout_id', workoutId).order('position', { ascending: false }).limit(1)
  if (error) throw error
  const position = data.length ? data[0].position + 1 : 0
  const { error: e2 } = await supabase.from('workout_exercises').insert({ workout_id: workoutId, exercise_id: uuids[code], position })
  if (e2) throw e2
}
