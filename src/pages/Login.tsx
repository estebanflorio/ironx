import { FormEvent, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '../hooks/useAuth';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'El email no es válido.',
  'auth/user-not-found': 'No existe una cuenta con ese email.',
  'auth/wrong-password': 'Contraseña incorrecta.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña necesita al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Probá de nuevo en un rato.'
};

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      const code = err instanceof FirebaseError ? err.code : '';
      setError(ERROR_MESSAGES[code] ?? 'Algo salió mal. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Registro de entrenamiento</p>
        <h1 className="mb-8 font-display text-4xl uppercase tracking-tightest text-paper">
          Iron<span className="text-chalk">X</span>
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-border bg-surface px-3 py-2.5 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@ejemplo.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-widest2 text-muted">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
              className="rounded-md border border-border bg-surface px-3 py-2.5 font-body text-sm text-paper placeholder:text-muted focus:border-chalk"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-md border border-ember/30 bg-ember/10 px-3 py-2 font-body text-xs text-ember">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-lg bg-chalk py-2.5 font-mono text-xs uppercase tracking-widest2 text-ink transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Un momento…' : mode === 'signIn' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
            setError(null);
          }}
          className="mt-5 w-full text-center font-mono text-xs uppercase tracking-widest2 text-muted hover:text-paper"
        >
          {mode === 'signIn' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Entrá'}
        </button>
      </div>
    </div>
  );
}
