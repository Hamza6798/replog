// Single access point for exercise data. Today it reads the local dataset;
// later this file can call Supabase or an external API without touching the UI.
import { exercises } from '../data/exercises.js'

const DIFF_RANK = { Beginner: 0, Intermediate: 1, Advanced: 2 }

export function queryExercises({ search = '', category = null, muscle = null, equipment = null, difficulty = null, sort = 'name-asc' } = {}) {
  const q = search.trim().toLowerCase()
  let list = exercises.filter((e) => {
    if (category && e.category !== category) return false
    if (muscle && e.primaryMuscle !== muscle) return false
    if (equipment && e.equipment !== equipment) return false
    if (difficulty && e.difficulty !== difficulty) return false
    if (!q) return true
    // every word typed must match the name, a muscle, category, equipment or type
    const hay = [e.name, e.category, e.primaryMuscle, e.equipment, e.type, e.difficulty, ...e.secondaryMuscles].join(' ').toLowerCase()
    return q.split(/[\s,]+/).filter(Boolean).every((w) => hay.includes(w))
  })
  const by = {
    'name-asc': (a, b) => a.name.localeCompare(b.name),
    'name-desc': (a, b) => b.name.localeCompare(a.name),
    'diff-asc': (a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || a.name.localeCompare(b.name),
    'diff-desc': (a, b) => DIFF_RANK[b.difficulty] - DIFF_RANK[a.difficulty] || a.name.localeCompare(b.name),
  }
  return list.sort(by[sort] || by['name-asc'])
}

export const getExerciseById = (id) => exercises.find((e) => e.id === id) || null

// Related exercises: scored by shared primary muscle, category, secondary muscles and equipment.
export function getRelatedExercises(exercise, limit = 4) {
  return exercises
    .filter((e) => e.id !== exercise.id)
    .map((e) => {
      let score = 0
      if (e.primaryMuscle === exercise.primaryMuscle) score += 4
      if (e.category === exercise.category) score += 2
      if (e.equipment === exercise.equipment) score += 1
      score += e.secondaryMuscles.filter((m) => exercise.secondaryMuscles.includes(m)).length
      return { e, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map((x) => x.e)
}
