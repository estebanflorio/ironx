export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: 'peso' | 'peso_corporal' | 'cardio';
}

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  restSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  createdAt: number;
}

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  sets: SetLog[];
}

export interface Session {
  id: string;
  routineId: string;
  routineName: string;
  date: number;
  exercises: ExerciseLog[];
}
