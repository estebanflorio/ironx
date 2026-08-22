import { useSessions } from '../hooks/useSessions';

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' });

export default function Progreso() {
  const { sessions, loading, getPersonalRecords } = useSessions();
  const prs = getPersonalRecords();
  const prEntries = Object.entries(prs).sort((a, b) => b[1].weight - a[1].weight);

  if (loading) {
    return <p className="py-10 text-center font-mono text-xs uppercase tracking-widest2 text-muted">Cargando…</p>;
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
        <p className="font-display text-xl uppercase tracking-tight text-paper">Sin datos todavía</p>
        <p className="max-w-[220px] font-body text-sm text-muted">
          Registrá tu primera sesión de entrenamiento para ver tu progreso acá.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Récords personales</p>
        <div className="flex flex-col gap-2">
          {prEntries.map(([exerciseId, pr]) => {
            const name = sessions
              .flatMap((s) => s.exercises)
              .find((e) => e.exerciseId === exerciseId)?.exerciseName ?? exerciseId;
            return (
              <div
                key={exerciseId}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3"
              >
                <p className="font-body text-sm text-paper">{name}</p>
                <div className="text-right">
                  <p className="font-mono text-lg font-bold tabular text-chalk">{pr.weight} kg</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest2 text-muted">
                    {dateFormatter.format(pr.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Historial de sesiones</p>
        <div className="flex flex-col gap-2">
          {sessions.map((s) => {
            const totalSets = s.exercises.reduce((sum, e) => sum + e.sets.length, 0);
            return (
              <div key={s.id} className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-display text-base uppercase tracking-tight text-paper">{s.routineName}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest2 text-muted">
                    {dateFormatter.format(s.date)}
                  </p>
                </div>
                <p className="font-mono text-xs text-muted">
                  {s.exercises.length} ejercicios · {totalSets} series
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
