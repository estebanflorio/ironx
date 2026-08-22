import { useTimer } from '../hooks/useTimer';

interface Props {
  defaultSeconds: number;
}

export function RestTimer({ defaultSeconds }: Props) {
  const { secondsLeft, isRunning, start, stop } = useTimer();

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = isRunning ? 1 - secondsLeft / defaultSeconds : 0;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-6 py-5">
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-raised">
        <div
          className="h-full rounded-full bg-ember transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="font-display text-5xl tabular tracking-tightest text-paper">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
      {isRunning ? (
        <button
          onClick={stop}
          className="w-full rounded-lg border border-ember/40 bg-ember/10 py-2.5 font-mono text-xs uppercase tracking-widest2 text-ember transition-colors hover:bg-ember/20"
        >
          Cancelar
        </button>
      ) : (
        <button
          onClick={() => start(defaultSeconds)}
          className="w-full rounded-lg bg-chalk py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90"
        >
          Iniciar descanso ({defaultSeconds}s)
        </button>
      )}
    </div>
  );
}
