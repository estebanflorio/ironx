import { useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import { RoutineExercise } from '../types';

const EMPTY_EXERCISE: RoutineExercise = {
  exerciseId: '',
  exerciseName: '',
  targetSets: 3,
  targetReps: 10,
  targetWeight: 0,
  restSeconds: 90
};

export default function Rutinas() {
  const { routines, loading, addRoutine, removeRoutine } = useRoutines();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([{ ...EMPTY_EXERCISE }]);

  const updateExercise = (index: number, patch: Partial<RoutineExercise>) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  };

  const handleCreate = async () => {
    const clean = exercises
      .filter((ex) => ex.exerciseName.trim())
      .map((ex, i) => ({ ...ex, exerciseId: ex.exerciseId || `${Date.now()}-${i}` }));
    if (!name.trim() || clean.length === 0) return;
    await addRoutine({ name: name.trim(), exercises: clean });
    setName('');
    setExercises([{ ...EMPTY_EXERCISE }]);
    setCreating(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">
          {routines.length} {routines.length === 1 ? 'rutina' : 'rutinas'}
        </p>
        <button
          onClick={() => setCreating((v) => !v)}
          className="rounded-lg bg-chalk px-4 py-2 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90"
        >
          {creating ? 'Cerrar' : '+ Nueva rutina'}
        </button>
      </div>

      {creating && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
          <input
            className="rounded-md border border-border bg-raised px-3 py-2.5 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
            placeholder="Nombre de la rutina (ej. Empuje / Día A)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-3">
            {exercises.map((ex, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
                <input
                  className="rounded-md border border-border bg-raised px-3 py-2 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
                  placeholder="Ejercicio (ej. Press banca)"
                  value={ex.exerciseName}
                  onChange={(e) => updateExercise(i, { exerciseName: e.target.value })}
                />
                <div className="flex gap-2">
                  <LabeledNumber label="Series" value={ex.targetSets} onChange={(v) => updateExercise(i, { targetSets: v })} />
                  <LabeledNumber label="Reps" value={ex.targetReps} onChange={(v) => updateExercise(i, { targetReps: v })} />
                  <LabeledNumber
                    label="Peso (kg)"
                    value={ex.targetWeight}
                    onChange={(v) => updateExercise(i, { targetWeight: v })}
                  />
                  <LabeledNumber
                    label="Descanso (s)"
                    value={ex.restSeconds}
                    onChange={(v) => updateExercise(i, { restSeconds: v })}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setExercises((prev) => [...prev, { ...EMPTY_EXERCISE }])}
            className="self-start font-mono text-xs uppercase tracking-widest2 text-chalk"
          >
            + Agregar ejercicio
          </button>

          <button
            onClick={handleCreate}
            className="rounded-lg bg-paper py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90"
          >
            Guardar rutina
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest2 text-muted">Cargando…</p>
      ) : routines.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
              <div>
                <p className="font-display text-lg uppercase tracking-tight text-paper">{r.name}</p>
                <p className="font-mono text-xs text-muted">
                  {r.exercises.length} {r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted/80">
                  {r.exercises
                    .slice(0, 3)
                    .map((ex) => `${ex.exerciseName} ${ex.targetWeight}kg`)
                    .join(' · ')}
                  {r.exercises.length > 3 ? '…' : ''}
                </p>
              </div>
              <button
                onClick={() => removeRoutine(r.id)}
                className="font-mono text-xs uppercase tracking-widest2 text-ember/80 hover:text-ember"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LabeledNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-1 flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">{label}</span>
      <input
        type="number"
        className="rounded-md border border-border bg-raised px-2 py-2 text-center font-mono text-sm text-paper focus:border-chalk"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
      <p className="font-display text-xl uppercase tracking-tight text-paper">Sin rutinas todavía</p>
      <p className="max-w-[220px] font-body text-sm text-muted">
        Creá tu primera rutina para empezar a registrar tus entrenamientos.
      </p>
    </div>
  );
}
