import { supabase } from '../lib/supabase.js'
import { exerciseUuids } from './workoutService.js'

const SELECT = 'id,name,updated_at,collection_exercises(added_at,exercises(code))'

const shape = (c) => ({
  id: c.id, name: c.name, updatedAt: c.updated_at,
  codes: [...c.collection_exercises].sort((a, b) => new Date(a.added_at) - new Date(b.added_at)).map((x) => x.exercises?.code).filter(Boolean),
})

export async function listCollections() {
  const { data, error } = await supabase.from('collections').select(SELECT).order('updated_at', { ascending: false })
  if (error) throw error
  return data.map(shape)
}

export async function getCollection(id) {
  const { data, error } = await supabase.from('collections').select(SELECT).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? shape(data) : null
}

export async function createCollection(userId, name) {
  const { data, error } = await supabase.from('collections').insert({ user_id: userId, name: name.trim() }).select('id').single()
  if (error) throw error
  return data.id
}

export async function renameCollection(id, name) {
  const { error } = await supabase.from('collections').update({ name: name.trim() }).eq('id', id)
  if (error) throw error
}

export async function deleteCollection(id) {
  const { error } = await supabase.from('collections').delete().eq('id', id)
  if (error) throw error
}

// Adding the same exercise twice is harmless: the second call is ignored.
export async function addToCollection(collectionId, code) {
  const uuids = await exerciseUuids()
  const { error } = await supabase.from('collection_exercises')
    .upsert({ collection_id: collectionId, exercise_id: uuids[code] }, { onConflict: 'collection_id,exercise_id', ignoreDuplicates: true })
  if (error) throw error
}

export async function removeFromCollection(collectionId, code) {
  const uuids = await exerciseUuids()
  const { error } = await supabase.from('collection_exercises').delete().eq('collection_id', collectionId).eq('exercise_id', uuids[code])
  if (error) throw error
}
