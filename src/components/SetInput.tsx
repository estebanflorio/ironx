import { useState } from 'react';
import { SetLog } from '../types';

interface Props {
  setNumber: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  onSave: (log: SetLog) => void;
}

export function SetInput({ setNumber, suggestedWeight, suggestedReps, onSave }: Props) {
  const [weight, setWeight] = useState(suggestedWeight ? String(suggestedWeight) : '');
  const [reps, setReps] = useState(suggestedReps ? String(suggestedReps) : '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!weight || !reps) return;
    onSave({ setNumber, weight: parseFloat(weight), reps: parseInt(reps, 10) });
    setSaved(true);
    setWeight(suggestedWeight ? String(suggestedWeight) : '');
    setReps(suggestedReps ? String(suggestedReps) : '');
  };

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex w-9 flex-shrink-0 items-center justify-center">
        <ChalkTick done={saved} />
      </div>
      <span className="w-14 flex-shrink-0 font-mono text-xs uppercase tracking-wide text-muted">
        Serie {setNumber}
      </span>
      <input
        className="w-16 rounded-md border border-border bg-raised px-2 py-2 text-center font-mono text-sm text-paper placeholder:text-muted focus:border-chalk"
        placeholder="kg"
        inputMode="decimal"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
      />
      <input
        className="w-16 rounded-md border border-border bg-raised px-2 py-2 text-center font-mono text-sm text-paper placeholder:text-muted focus:border-chalk"
        placeholder="reps"
        inputMode="numeric"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
      />
      <button
        onClick={handleSave}
        className="ml-auto rounded-md bg-chalk px-3 py-2 font-mono text-xs font-bold uppercase text-ink transition-opacity hover:opacity-90 active:opacity-75"
      >
        OK
      </button>
    </div>
  );
}

// Marca tipo tiza de gimnasio: se "completa" cuando la serie queda guardada,
// haciendo eco a la tiza que se usa para marcar repeticiones en el fierro.
function ChalkTick({ done }: { done: boolean }) {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" className={done ? 'text-chalk' : 'text-border'}>
      <line x1="8" y1="1" x2="8" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
