import { useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import { Routine, RoutineExercise } from '../types';

const EMPTY_EXERCISE: RoutineExercise = {
  exerciseId: '',
  exerciseName: '',
  targetSets: 3,
  targetReps: 10,
  targetWeight: 0,
  restSeconds: 90
};

export default function Rutinas() {
  const { routines, loading, addRoutine, updateRoutine, removeRoutine, moveRoutine } = useRoutines();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([{ ...EMPTY_EXERCISE }]);

  const resetForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setName('');
    setExercises([{ ...EMPTY_EXERCISE }]);
  };

  const startCreate = () => {
    if (formOpen && !editingId) {
      resetForm();
      return;
    }
    setEditingId(null);
    setName('');
    setExercises([{ ...EMPTY_EXERCISE }]);
    setFormOpen(true);
  };

  const startEdit = (r: Routine) => {
    setEditingId(r.id);
    setName(r.name);
    setExercises(r.exercises.map((ex) => ({ ...ex })));
    setFormOpen(true);
  };

  const updateExercise = (index: number, patch: Partial<RoutineExercise>) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  };

  const removeExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const clean = exercises
      .filter((ex) => ex.exerciseName.trim())
      .map((ex, i) => ({ ...ex, exerciseId: ex.exerciseId || `${Date.now()}-${i}` }));
    if (!name.trim() || clean.length === 0) return;

    if (editingId) {
      await updateRoutine(editingId, { name: name.trim(), exercises: clean });
    } else {
      await addRoutine({ name: name.trim(), exercises: clean });
    }
    resetForm();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">
          {routines.length} {routines.length === 1 ? 'rutina' : 'rutinas'}
        </p>
        <button
          onClick={startCreate}
          className="rounded-lg bg-chalk px-4 py-2 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90"
        >
          {formOpen && !editingId ? 'Cerrar' : '+ Nueva rutina'}
        </button>
      </div>

      {formOpen && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-chalk">
              {editingId ? 'Editando rutina' : 'Rutina nueva'}
            </p>
            {editingId && (
              <button onClick={resetForm} className="font-mono text-[11px] uppercase tracking-widest2 text-muted hover:text-paper">
                Cancelar edición
              </button>
            )}
          </div>

          <input
            className="rounded-md border border-border bg-raised px-3 py-2.5 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
            placeholder="Nombre de la rutina (ej. Empuje / Día A)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-3">
            {exercises.map((ex, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-border/60 p-3">
                <div className="flex min-w-0 items-center gap-2">
                  <input
                    className="min-w-0 flex-1 rounded-md border border-border bg-raised px-3 py-2 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
                    placeholder="Ejercicio (ej. Press banca)"
                    value={ex.exerciseName}
                    onChange={(e) => updateExercise(i, { exerciseName: e.target.value })}
                  />
                  {exercises.length > 1 && (
                    <button
                      onClick={() => removeExercise(i)}
                      className="flex-shrink-0 font-mono text-[11px] uppercase tracking-widest2 text-ember/80 hover:text-ember"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
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
            onClick={handleSave}
            className="rounded-lg bg-paper py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90"
          >
            {editingId ? 'Guardar cambios' : 'Guardar rutina'}
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-10 text-center font-mono text-xs uppercase tracking-widest2 text-muted">Cargando…</p>
      ) : routines.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((r, i) => (
            <div key={r.id} className="flex items-stretch gap-3 rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-col justify-center gap-1">
                <button
                  onClick={() => moveRoutine(r.id, 'up')}
                  disabled={i === 0}
                  className="text-muted hover:text-chalk disabled:opacity-20"
                  aria-label="Mover arriba"
                >
                  <ArrowIcon direction="up" />
                </button>
                <button
                  onClick={() => moveRoutine(r.id, 'down')}
                  disabled={i === routines.length - 1}
                  className="text-muted hover:text-chalk disabled:opacity-20"
                  aria-label="Mover abajo"
                >
                  <ArrowIcon direction="down" />
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-lg uppercase tracking-tight text-paper">{r.name}</p>
                <p className="font-mono text-xs text-muted">
                  {r.exercises.length} {r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                </p>
                <p className="mt-1 break-words font-mono text-[11px] text-muted/80">
                  {r.exercises
                    .slice(0, 3)
                    .map((ex) => `${ex.exerciseName} ${ex.targetWeight}kg`)
                    .join(' · ')}
                  {r.exercises.length > 3 ? '…' : ''}
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col items-end justify-between gap-1">
                <button
                  onClick={() => startEdit(r)}
                  className="font-mono text-xs uppercase tracking-widest2 text-muted hover:text-chalk"
                >
                  Editar
                </button>
                <button
                  onClick={() => removeRoutine(r.id)}
                  className="font-mono text-xs uppercase tracking-widest2 text-ember/80 hover:text-ember"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LabeledNumber({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="truncate font-mono text-[10px] uppercase tracking-widest2 text-muted">{label}</span>
      <input
        type="number"
        className="w-full min-w-0 rounded-md border border-border bg-raised px-2 py-2 text-center font-mono text-sm text-paper focus:border-chalk"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}

function ArrowIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: direction === 'down' ? 'rotate(180deg)' : undefined }}
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
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
