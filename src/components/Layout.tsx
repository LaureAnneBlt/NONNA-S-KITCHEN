import { NavLink, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import InstallPrompt from './InstallPrompt';

const tab = ({ isActive }: { isActive: boolean }) =>
  `flex-1 py-3 text-center text-sm font-bold ${isActive ? 'text-primary' : 'text-muted'}`;

export default function Layout() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg pb-24">
      <main className="p-5"><InstallPrompt /><Outlet /></main>
      <nav className="fixed inset-x-0 bottom-0 border-t-2 border-line bg-surface pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg">
          <NavLink to="/" end className={tab}>🍝 Ricette</NavLink>
          <NavLink to="/famiglie" className={tab}>👵 Famiglie</NavLink>
          <button className="flex-1 py-3 text-sm font-bold text-muted" onClick={() => supabase.auth.signOut()}>Sortir</button>
        </div>
      </nav>
    </div>
  );
}
