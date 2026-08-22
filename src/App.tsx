import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Rutinas from './pages/Rutinas';
import Registro from './pages/Registro';
import Progreso from './pages/Progreso';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';

const TABS = [
  { to: '/', label: 'Rutinas', icon: IconClipboard, end: true },
  { to: '/registro', label: 'Registro', icon: IconBarbell, end: false },
  { to: '/progreso', label: 'Progreso', icon: IconChart, end: false }
];

export default function App() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <p className="font-mono text-xs uppercase tracking-widest2 text-muted">Cargando…</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-ink">
        <header className="safe-top flex items-start justify-between border-b border-border px-5 pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-muted">Registro de entrenamiento</p>
            <h1 className="font-display text-3xl uppercase tracking-tightest text-paper">
              Iron<span className="text-chalk">X</span>
            </h1>
          </div>
          <button
            onClick={signOut}
            className="mt-1 font-mono text-[10px] uppercase tracking-widest2 text-muted hover:text-ember"
          >
            Salir
          </button>
        </header>

        <main className="flex-1 overflow-y-auto px-5 pb-28 pt-5">
          <Routes>
            <Route path="/" element={<Rutinas />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/progreso" element={<Progreso />} />
          </Routes>
        </main>

        <nav className="safe-bottom fixed inset-x-0 bottom-0 border-t border-border bg-surface/95 backdrop-blur">
          <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-2">
            {TABS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-1 flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'text-chalk' : 'text-muted'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon active={isActive} />
                    <span className="font-mono text-[10px] uppercase tracking-widest2">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </BrowserRouter>
  );
}

function IconClipboard({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h6" strokeLinecap="round" />
    </svg>
  );
}

function IconBarbell({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
      <path d="M4 9v6M2 10v4M20 9v6M22 10v4" strokeLinecap="round" />
      <path d="M7 12h10" strokeLinecap="round" />
      <rect x="6" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" stroke="none" />
      <rect x="15.5" y="8" width="2.5" height="8" rx="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconChart({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6}>
      <path d="M4 20V10M11 20V4M18 20v-7" strokeLinecap="round" />
      <path d="M3 20h18" strokeLinecap="round" />
    </svg>
  );
}
