import { details } from './exerciseDetails.js'
import { IMAGE_IDS } from './exerciseImages.js'
import { exerciseImages } from './exerciseImages.js'
// Local exercise dataset (Phase 1). One row per exercise:
// name | category | primary muscle | secondary muscles | equipment | difficulty | type
// Instructions, common mistakes and licensed media are added in Phase 2.
const RAW = `
Barbell Bench Press|Chest|Pectorals|Triceps,Front Delts|Barbell|Intermediate|Compound
Incline Dumbbell Press|Chest|Upper Chest|Triceps,Front Delts|Dumbbell|Intermediate|Compound
Dumbbell Bench Press|Chest|Pectorals|Triceps,Front Delts|Dumbbell|Beginner|Compound
Dumbbell Fly|Chest|Pectorals|Front Delts|Dumbbell|Beginner|Isolation
Push-Up|Chest|Pectorals|Triceps,Front Delts,Abs|Bodyweight|Beginner|Compound
Cable Crossover|Chest|Pectorals|Front Delts|Cable|Intermediate|Isolation
Machine Chest Press|Chest|Pectorals|Triceps,Front Delts|Machine|Beginner|Compound
Decline Barbell Press|Chest|Lower Chest|Triceps,Front Delts|Barbell|Advanced|Compound
Pull-Up|Back|Lats|Biceps,Rear Delts|Bodyweight|Advanced|Compound
Lat Pulldown|Back|Lats|Biceps,Rear Delts|Cable|Beginner|Compound
Barbell Row|Back|Lats|Biceps,Rear Delts,Lower Back|Barbell|Intermediate|Compound
One-Arm Dumbbell Row|Back|Lats|Biceps,Rear Delts|Dumbbell|Beginner|Compound
Seated Cable Row|Back|Mid Back|Lats,Biceps|Cable|Beginner|Compound
Conventional Deadlift|Back|Lower Back|Glutes,Hamstrings,Traps|Barbell|Advanced|Compound
T-Bar Row|Back|Mid Back|Lats,Biceps|Machine|Intermediate|Compound
Resistance Band Pull-Apart|Back|Rear Delts|Mid Back|Resistance Band|Beginner|Isolation
Straight-Arm Pulldown|Back|Lats|Triceps|Cable|Intermediate|Isolation
Barbell Overhead Press|Shoulders|Front Delts|Triceps,Upper Chest|Barbell|Intermediate|Compound
Dumbbell Shoulder Press|Shoulders|Front Delts|Triceps,Side Delts|Dumbbell|Beginner|Compound
Dumbbell Lateral Raise|Shoulders|Side Delts|Traps|Dumbbell|Beginner|Isolation
Dumbbell Front Raise|Shoulders|Front Delts|Upper Chest|Dumbbell|Beginner|Isolation
Rear Delt Fly|Shoulders|Rear Delts|Mid Back|Dumbbell|Intermediate|Isolation
Arnold Press|Shoulders|Front Delts|Side Delts,Triceps|Dumbbell|Intermediate|Compound
Cable Lateral Raise|Shoulders|Side Delts|Traps|Cable|Intermediate|Isolation
Barbell Curl|Biceps|Biceps|Forearms|Barbell|Beginner|Isolation
Dumbbell Hammer Curl|Biceps|Brachialis|Biceps,Forearms|Dumbbell|Beginner|Isolation
Incline Dumbbell Curl|Biceps|Biceps|Forearms|Dumbbell|Intermediate|Isolation
Cable Curl|Biceps|Biceps|Forearms|Cable|Beginner|Isolation
Machine Preacher Curl|Biceps|Biceps|Forearms|Machine|Beginner|Isolation
Resistance Band Curl|Biceps|Biceps|Forearms|Resistance Band|Beginner|Isolation
Triceps Pushdown|Triceps|Triceps|Forearms|Cable|Beginner|Isolation
Skull Crusher|Triceps|Triceps|Front Delts|Barbell|Intermediate|Isolation
Overhead Dumbbell Extension|Triceps|Triceps|Front Delts|Dumbbell|Beginner|Isolation
Close-Grip Bench Press|Triceps|Triceps|Pectorals,Front Delts|Barbell|Intermediate|Compound
Bench Dip|Triceps|Triceps|Front Delts,Pectorals|Bodyweight|Beginner|Compound
Dumbbell Kickback|Triceps|Triceps|Rear Delts|Dumbbell|Beginner|Isolation
Barbell Back Squat|Legs|Quadriceps|Glutes,Hamstrings,Lower Back|Barbell|Intermediate|Compound
Kettlebell Goblet Squat|Legs|Quadriceps|Glutes,Abs|Kettlebell|Beginner|Compound
Leg Press|Legs|Quadriceps|Glutes,Hamstrings|Machine|Beginner|Compound
Romanian Deadlift|Legs|Hamstrings|Glutes,Lower Back|Barbell|Intermediate|Compound
Walking Lunge|Legs|Quadriceps|Glutes,Hamstrings|Dumbbell|Intermediate|Compound
Leg Extension|Legs|Quadriceps|-|Machine|Beginner|Isolation
Seated Leg Curl|Legs|Hamstrings|Calves|Machine|Beginner|Isolation
Standing Calf Raise|Legs|Calves|-|Machine|Beginner|Isolation
Bulgarian Split Squat|Legs|Quadriceps|Glutes,Hamstrings|Dumbbell|Advanced|Compound
Barbell Hip Thrust|Legs|Glutes|Hamstrings,Quadriceps|Barbell|Intermediate|Compound
Bodyweight Squat|Legs|Quadriceps|Glutes|Bodyweight|Beginner|Compound
Plank|Abs|Abs|Obliques,Lower Back|Bodyweight|Beginner|Isometric
Crunch|Abs|Abs|Obliques|Bodyweight|Beginner|Isolation
Hanging Leg Raise|Abs|Lower Abs|Hip Flexors,Forearms|Bodyweight|Advanced|Compound
Cable Crunch|Abs|Abs|Obliques|Cable|Intermediate|Isolation
Russian Twist|Abs|Obliques|Abs|Other|Intermediate|Isolation
Ab Wheel Rollout|Abs|Abs|Lats,Front Delts|Other|Advanced|Compound
Jump Rope|Cardio|Calves|Shoulders,Quadriceps|Other|Beginner|Cardio
Burpee|Cardio|Full Body|Pectorals,Quadriceps,Triceps|Bodyweight|Intermediate|Cardio
Mountain Climber|Cardio|Abs|Shoulders,Quadriceps|Bodyweight|Beginner|Cardio
Rowing Machine|Cardio|Lats|Quadriceps,Hamstrings,Biceps|Machine|Beginner|Cardio
Jumping Jacks|Cardio|Calves|Shoulders,Quadriceps|Bodyweight|Beginner|Cardio
Kettlebell Swing|Full Body|Glutes|Hamstrings,Lower Back,Shoulders|Kettlebell|Intermediate|Compound
Dumbbell Thruster|Full Body|Quadriceps|Shoulders,Glutes,Triceps|Dumbbell|Intermediate|Compound
Barbell Clean and Press|Full Body|Glutes|Quadriceps,Shoulders,Traps|Barbell|Advanced|Compound
Turkish Get-Up|Full Body|Shoulders|Abs,Glutes,Quadriceps|Kettlebell|Advanced|Compound
Farmer's Carry|Full Body|Forearms|Traps,Abs,Glutes|Dumbbell|Beginner|Compound
Resistance Band Squat to Press|Full Body|Quadriceps|Shoulders,Glutes|Resistance Band|Beginner|Compound
`

export const CATEGORIES = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Cardio', 'Full Body']
export const EQUIPMENT = ['Dumbbell', 'Barbell', 'Cable', 'Machine', 'Bodyweight', 'Resistance Band', 'Kettlebell', 'Other']
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

export const exercises = RAW.trim().split('\n').map((line, i) => {
  const [name, category, primaryMuscle, secondary, equipment, difficulty, type] = line.split('|')
  const id = String(i + 1).padStart(4, '0')
  return {
    id,
    name,
    category,
    primaryMuscle,
    secondaryMuscles: secondary === '-' ? [] : secondary.split(','),
    equipment,
    difficulty,
    type,
    instructions: details[name]?.instructions ?? [],
    mistakes: details[name]?.mistakes ?? [],
    images: exerciseImages[String(i + 1).padStart(4, '0')] ?? [], // start / end position photos
    imageUrl: exerciseImages[String(i + 1).padStart(4, '0')]?.[0] ?? null,
  }
})

export const MUSCLES = [...new Set(exercises.map((e) => e.primaryMuscle))].sort()
