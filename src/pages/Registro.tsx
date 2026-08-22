import { useMemo, useState } from 'react';
import { useRoutines } from '../hooks/useRoutines';
import { useSessions } from '../hooks/useSessions';
import { SetInput } from '../components/SetInput';
import { RestTimer } from '../components/RestTimer';
import { ExerciseLog, Routine, SetLog } from '../types';

export default function Registro() {
  const { routines, loading } = useRoutines();
  const { logSession } = useSessions();
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [logs, setLogs] = useState<Record<string, SetLog[]>>({});
  const [extraSets, setExtraSets] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const totalSetsLogged = useMemo(
    () => Object.values(logs).reduce((sum, sets) => sum + sets.length, 0),
    [logs]
  );

  if (!activeRoutine) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Elegí una rutina para empezar</p>
        {loading ? (
          <p className="py-10 text-center font-mono text-xs uppercase tracking-widest2 text-muted">Cargando…</p>
        ) : routines.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-10 text-center font-body text-sm text-muted">
            Todavía no creaste ninguna rutina. Andá a la pestaña Rutinas para armar la primera.
          </p>
        ) : (
          routines.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRoutine(r);
                setLogs({});
                setExtraSets({});
                setSaved(false);
              }}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-chalk/60"
            >
              <div>
                <p className="font-display text-lg uppercase tracking-tight text-paper">{r.name}</p>
                <p className="font-mono text-xs text-muted">{r.exercises.length} ejercicios</p>
              </div>
              <span className="font-mono text-xs uppercase tracking-widest2 text-chalk">Empezar →</span>
            </button>
          ))
        )}
      </div>
    );
  }

  const handleSaveSet = (exerciseId: string, log: SetLog) => {
    setLogs((prev) => ({ ...prev, [exerciseId]: [...(prev[exerciseId] ?? []), log] }));
  };

  const handleFinish = async () => {
    const exerciseLogs: ExerciseLog[] = activeRoutine.exercises
      .filter((ex) => (logs[ex.exerciseId] ?? []).length > 0)
      .map((ex) => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        sets: logs[ex.exerciseId]
      }));

    if (exerciseLogs.length === 0) return;

    await logSession({
      routineId: activeRoutine.id,
      routineName: activeRoutine.name,
      date: Date.now(),
      exercises: exerciseLogs
    });
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-chalk/40 bg-chalk/5 py-14 text-center">
        <p className="font-display text-2xl uppercase tracking-tight text-paper">Sesión guardada</p>
        <p className="font-mono text-xs text-muted">{totalSetsLogged} series registradas</p>
        <button
          onClick={() => setActiveRoutine(null)}
          className="mt-2 rounded-lg bg-chalk px-5 py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink"
        >
          Volver a rutinas
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Entrenando</p>
          <p className="font-display text-xl uppercase tracking-tight text-paper">{activeRoutine.name}</p>
        </div>
        <button
          onClick={() => setActiveRoutine(null)}
          className="font-mono text-xs uppercase tracking-widest2 text-muted hover:text-paper"
        >
          Cancelar
        </button>
      </div>

      {activeRoutine.exercises.map((ex) => (
        <div key={ex.exerciseId} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-lg uppercase tracking-tight text-paper">{ex.exerciseName}</p>
            <p className="font-mono text-xs text-muted">
              objetivo {ex.targetSets}×{ex.targetReps} · {ex.targetWeight}kg
            </p>
          </div>

          <div className="flex flex-col divide-y divide-border/60">
            {Array.from({ length: ex.targetSets + (extraSets[ex.exerciseId] ?? 0) }).map((_, i) => (
              <SetInput
                key={i}
                setNumber={i + 1}
                suggestedWeight={ex.targetWeight}
                suggestedReps={ex.targetReps}
                onSave={(log) => handleSaveSet(ex.exerciseId, log)}
              />
            ))}
          </div>

          <button
            onClick={() => setExtraSets((prev) => ({ ...prev, [ex.exerciseId]: (prev[ex.exerciseId] ?? 0) + 1 }))}
            className="self-start font-mono text-[11px] uppercase tracking-widest2 text-muted hover:text-chalk"
          >
            + Agregar serie extra
          </button>

          <RestTimer defaultSeconds={ex.restSeconds} />
        </div>
      ))}

      <button
        onClick={handleFinish}
        disabled={totalSetsLogged === 0}
        className="rounded-lg bg-paper py-3 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity disabled:opacity-30"
      >
        Terminar sesión ({totalSetsLogged} series)
      </button>
    </div>
  );
}