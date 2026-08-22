import { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';

const dateFormatter = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'short' });

function computeBmi(weightKg: number | null, heightCm: number | null) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

function bmiLabel(bmi: number) {
  if (bmi < 18.5) return 'Bajo peso';
  if (bmi < 25) return 'Rango saludable';
  if (bmi < 30) return 'Sobrepeso';
  return 'Obesidad';
}

export default function Perfil() {
  const { profile, loading, saveProfile, logWeight } = useProfile();

  const [displayName, setDisplayName] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [goalWeightKg, setGoalWeightKg] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newWeight, setNewWeight] = useState('');
  const [loggingWeight, setLoggingWeight] = useState(false);

  // Sincroniza el formulario con lo que llega de Firestore, sin pisar
  // lo que el usuario esté tipeando si todavía no cargó.
  useEffect(() => {
    if (loading) return;
    setDisplayName(profile.displayName ?? '');
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    setGoalWeightKg(profile.goalWeightKg != null ? String(profile.goalWeightKg) : '');
    setBirthYear(profile.birthYear != null ? String(profile.birthYear) : '');
  }, [loading, profile]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await saveProfile({
        displayName: displayName.trim(),
        heightCm: heightCm ? Number(heightCm) : null,
        currentWeightKg: profile.currentWeightKg,
        goalWeightKg: goalWeightKg ? Number(goalWeightKg) : null,
        birthYear: birthYear ? Number(birthYear) : null
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogWeight = async () => {
    const value = Number(newWeight);
    if (!value) return;
    setLoggingWeight(true);
    try {
      await logWeight(value);
      setNewWeight('');
    } finally {
      setLoggingWeight(false);
    }
  };

  const bmi = computeBmi(profile.currentWeightKg, profile.heightCm);
  const recentWeights = [...profile.weightHistory].reverse().slice(0, 6);

  if (loading) {
    return <p className="py-10 text-center font-mono text-xs uppercase tracking-widest2 text-muted">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Datos personales</p>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">Nombre</span>
          <input
            className="rounded-md border border-border bg-raised px-3 py-2.5 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Tu nombre"
          />
        </label>

        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">Altura (cm)</span>
            <input
              type="number"
              inputMode="numeric"
              className="rounded-md border border-border bg-raised px-3 py-2.5 text-center font-mono text-sm text-paper focus:border-chalk"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="175"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">Año nac.</span>
            <input
              type="number"
              inputMode="numeric"
              className="rounded-md border border-border bg-raised px-3 py-2.5 text-center font-mono text-sm text-paper focus:border-chalk"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="1995"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">Objetivo (kg)</span>
            <input
              type="number"
              inputMode="decimal"
              className="rounded-md border border-border bg-raised px-3 py-2.5 text-center font-mono text-sm text-paper focus:border-chalk"
              value={goalWeightKg}
              onChange={(e) => setGoalWeightKg(e.target.value)}
              placeholder="80"
            />
          </label>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="rounded-lg bg-paper py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {savingProfile ? 'Guardando…' : 'Guardar datos'}
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Peso corporal</p>
          {bmi && (
            <p className="font-mono text-[11px] text-muted">
              IMC {bmi.toFixed(1)} · <span className="text-chalk">{bmiLabel(bmi)}</span>
            </p>
          )}
        </div>

        <p className="font-display text-4xl tabular tracking-tightest text-paper">
          {profile.currentWeightKg ? `${profile.currentWeightKg} kg` : '—'}
        </p>

        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            className="flex-1 rounded-md border border-border bg-raised px-3 py-2.5 text-center font-mono text-sm text-paper placeholder:text-muted focus:border-chalk"
            placeholder="Peso de hoy (kg)"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          <button
            onClick={handleLogWeight}
            disabled={loggingWeight || !newWeight}
            className="rounded-md bg-chalk px-4 py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Registrar
          </button>
        </div>

        {recentWeights.length > 0 && (
          <div className="flex flex-col divide-y divide-border/60 pt-1">
            {recentWeights.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="font-mono text-[11px] uppercase tracking-widest2 text-muted">
                  {dateFormatter.format(entry.date)}
                </span>
                <span className="font-mono text-sm tabular text-paper">{entry.weightKg} kg</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
