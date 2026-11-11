import { supabase } from '../lib/supabase.js'
import { exerciseUuids } from './workoutService.js'

export async function listPrograms() {
  const { data, error } = await supabase
    .from('programs')
    .select('id,name,description,template,updated_at,program_days(id,weekday,program_exercises(id))')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data.map((p) => ({
    id: p.id, name: p.name, description: p.description, template: p.template, updatedAt: p.updated_at,
    days: p.program_days.length,
    exercises: p.program_days.reduce((n, d) => n + d.program_exercises.length, 0),
  }))
}

export async function getProgram(id) {
  const { data, error } = await supabase
    .from('programs')
    .select('id,name,description,template,program_days(id,position,name,weekday,program_exercises(id,position,sets,reps,rest_seconds,notes,exercises(code)))')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const days = [...data.program_days].sort((a, b) => a.position - b.position).map((d) => ({
    key: d.id, rowId: d.id, name: d.name, weekday: d.weekday == null ? '' : String(d.weekday),
    items: [...d.program_exercises].sort((a, b) => a.position - b.position).filter((r) => r.exercises).map((r) => ({
      key: r.id, rowId: r.id, code: r.exercises.code, sets: String(r.sets), reps: r.reps, weight: '', rest: String(r.rest_seconds), notes: r.notes || '',
    })),
  }))
  return { id: data.id, name: data.name, description: data.description || '', template: data.template, days }
}

const notIn = (ids) => `(${ids.join(',')})`

// Rows are upserted first and leftovers deleted last, so a failure never loses saved data.
export async function saveProgram(userId, { id, name, description, template, days }) {
  const uuids = await exerciseUuids()
  let programId = id
  const fields = { name: name.trim(), description: description.trim() || null, template: template || null }
  if (id) {
    const { error } = await supabase.from('programs').update(fields).eq('id', id)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from('programs').insert({ user_id: userId, ...fields }).select('id').single()
    if (error) throw error
    programId = data.id
  }
  const dayRows = days.map((d, i) => ({ id: d.rowId || crypto.randomUUID(), program_id: programId, position: i, name: d.name.trim(), weekday: d.weekday === '' ? null : Number(d.weekday) }))
  const exRows = days.flatMap((d, di) => d.items.map((it, i) => ({
    id: it.rowId || crypto.randomUUID(), program_day_id: dayRows[di].id, exercise_id: uuids[it.code], position: i,
    sets: Number(it.sets), reps: String(it.reps).trim(), rest_seconds: Number(it.rest), notes: it.notes?.trim() || null,
  })))
  try {
    let r = await supabase.from('program_days').upsert(dayRows); if (r.error) throw r.error
    r = await supabase.from('program_exercises').upsert(exRows); if (r.error) throw r.error
    r = await supabase.from('program_exercises').delete().in('program_day_id', dayRows.map((d) => d.id)).not('id', 'in', notIn(exRows.map((x) => x.id))); if (r.error) throw r.error
    r = await supabase.from('program_days').delete().eq('program_id', programId).not('id', 'in', notIn(dayRows.map((d) => d.id))); if (r.error) throw r.error
  } catch (err) {
    if (!id) await supabase.from('programs').delete().eq('id', programId)
    throw err
  }
  return programId
}

export async function duplicateProgram(userId, id) {
  const p = await getProgram(id)
  if (!p) throw new Error('Program not found.')
  const days = p.days.map((d) => ({ ...d, rowId: null, items: d.items.map((i) => ({ ...i, rowId: null })) }))
  return saveProgram(userId, { name: `${p.name} (copy)`.slice(0, 100), description: p.description, template: p.template, days })
}

export async function deleteProgram(id) {
  const { error } = await supabase.from('programs').delete().eq('id', id)
  if (error) throw error
}
