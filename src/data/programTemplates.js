// Starting templates. Exercises are referenced by name and resolved against the real dataset.
// Each exercise row: [name, sets, reps, rest seconds, optional note]
import { exercises } from './exercises.js'

const PUSH_A = [['Barbell Bench Press', 4, '6-8', 120], ['Barbell Overhead Press', 3, '8-10', 90], ['Incline Dumbbell Press', 3, '8-12', 90], ['Dumbbell Lateral Raise', 3, '12-15', 60], ['Triceps Pushdown', 3, '10-12', 60], ['Overhead Dumbbell Extension', 2, '12-15', 60]]
const PUSH_B = [['Dumbbell Shoulder Press', 4, '8-10', 90], ['Dumbbell Bench Press', 3, '8-12', 90], ['Cable Crossover', 3, '12-15', 60], ['Cable Lateral Raise', 3, '12-15', 60], ['Skull Crusher', 3, '10-12', 60], ['Push-Up', 2, '10-15', 60]]
const PULL_A = [['Barbell Row', 4, '6-8', 120], ['Lat Pulldown', 3, '8-12', 90], ['Seated Cable Row', 3, '10-12', 90], ['Rear Delt Fly', 3, '12-15', 60], ['Barbell Curl', 3, '8-12', 60], ['Dumbbell Hammer Curl', 2, '10-12', 60]]
const PULL_B = [['T-Bar Row', 3, '8-10', 90], ['One-Arm Dumbbell Row', 3, '10-12', 75], ['Straight-Arm Pulldown', 3, '12-15', 60], ['Resistance Band Pull-Apart', 3, '15-20', 45], ['Incline Dumbbell Curl', 3, '10-12', 60], ['Cable Curl', 2, '12-15', 60]]
const LEGS_A = [['Barbell Back Squat', 4, '6-8', 150], ['Romanian Deadlift', 3, '8-10', 120], ['Leg Press', 3, '10-12', 90], ['Seated Leg Curl', 3, '10-12', 60], ['Standing Calf Raise', 4, '12-15', 45], ['Plank', 3, '30-45', 45, 'Hold for this many seconds']]
const LEGS_B = [['Bulgarian Split Squat', 3, '8-10', 90], ['Barbell Hip Thrust', 3, '8-12', 90], ['Leg Extension', 3, '12-15', 60], ['Seated Leg Curl', 3, '12-15', 60], ['Standing Calf Raise', 3, '12-15', 45], ['Cable Crunch', 3, '12-15', 60]]
const UPPER_A = [['Barbell Bench Press', 4, '6-8', 120], ['Barbell Row', 4, '6-8', 120], ['Barbell Overhead Press', 3, '8-10', 90], ['Lat Pulldown', 3, '8-12', 90], ['Barbell Curl', 2, '10-12', 60], ['Triceps Pushdown', 2, '10-12', 60]]
const UPPER_B = [['Incline Dumbbell Press', 3, '8-12', 90], ['Seated Cable Row', 3, '8-12', 90], ['Dumbbell Shoulder Press', 3, '8-12', 90], ['One-Arm Dumbbell Row', 3, '10-12', 75], ['Dumbbell Hammer Curl', 2, '10-12', 60], ['Skull Crusher', 2, '10-12', 60]]
const FULL_A = [['Kettlebell Goblet Squat', 3, '8-12', 90], ['Dumbbell Bench Press', 3, '8-12', 90], ['Seated Cable Row', 3, '10-12', 90], ['Dumbbell Shoulder Press', 2, '10-12', 60], ['Plank', 3, '30-45', 45, 'Hold for this many seconds']]
const FULL_B = [['Leg Press', 3, '10-12', 90], ['Machine Chest Press', 3, '10-12', 90], ['Lat Pulldown', 3, '10-12', 90], ['Seated Leg Curl', 2, '10-12', 60], ['Crunch', 3, '12-15', 45]]
const FULL_C = [['Kettlebell Goblet Squat', 3, '8-12', 90], ['Push-Up', 3, '8-12', 60], ['One-Arm Dumbbell Row', 3, '10-12', 75], ['Dumbbell Lateral Raise', 3, '12-15', 60], ['Dumbbell Hammer Curl', 2, '10-12', 60]]

export const TEMPLATES = [
  { key: 'beginner-3', title: '3-Day Beginner', level: 'Beginner', description: 'Full-body sessions three times a week with rest days between.',
    days: [['Full Body A', 0, FULL_A], ['Full Body B', 2, FULL_B], ['Full Body C', 4, FULL_C]] },
  { key: 'upper-lower-4', title: '4-Day Upper / Lower', level: 'Intermediate', description: 'Alternates upper-body and lower-body days across the week.',
    days: [['Upper A', 0, UPPER_A], ['Lower A', 1, LEGS_A], ['Upper B', 3, UPPER_B], ['Lower B', 4, LEGS_B]] },
  { key: 'ppl-5', title: '5-Day Push / Pull / Legs', level: 'Intermediate', description: 'Push, pull and legs, then a second push and pull day.',
    days: [['Push A', 0, PUSH_A], ['Pull A', 1, PULL_A], ['Legs A', 2, LEGS_A], ['Push B', 4, PUSH_B], ['Pull B', 5, PULL_B]] },
  { key: 'ppl-6', title: '6-Day Push / Pull / Legs', level: 'Advanced', description: 'Push, pull and legs twice a week with one rest day.',
    days: [['Push A', 0, PUSH_A], ['Pull A', 1, PULL_A], ['Legs A', 2, LEGS_A], ['Push B', 3, PUSH_B], ['Pull B', 4, PULL_B], ['Legs B', 5, LEGS_B]] },
]

const byName = Object.fromEntries(exercises.map((e) => [e.name, e.id]))

export const newProgramItem = (code, sets = '3', reps = '8-12', rest = '60', notes = '') =>
  ({ key: crypto.randomUUID(), rowId: null, code, sets: String(sets), reps, weight: '', rest: String(rest), notes })

export const newProgramDay = (name, weekday = '', items = []) => ({ key: crypto.randomUUID(), rowId: null, name, weekday: String(weekday), items })

// Turns a template into editable state using real exercise records.
export function buildFromTemplate(key) {
  const t = TEMPLATES.find((x) => x.key === key)
  if (!t) return null
  return {
    name: t.title, description: t.description, template: t.key,
    days: t.days.map(([name, weekday, rows]) => newProgramDay(name, weekday, rows.map(([n, s, r, rest, note]) => {
      if (!byName[n]) throw new Error(`Template exercise not in dataset: ${n}`)
      return newProgramItem(byName[n], s, r, rest, note || '')
    }))),
  }
}
