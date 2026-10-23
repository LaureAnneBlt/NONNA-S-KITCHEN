import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import InstallPrompt from "./InstallPrompt";
import { Icon, IconName } from "./Icons";

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-bold transition ${isActive ? "text-brass" : "text-on-primary/70"}`;

const NavItem = ({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: IconName;
  label: string;
  end?: boolean;
}) => (
  <NavLink to={to} end={end} className={itemClass}>
    <Icon name={icon} />
    {label}
  </NavLink>
);

export default function Layout() {
  return (
    <div className="min-h-dvh pb-28">
      <header className="app-header">
        <div className="mx-auto max-w-lg font-display text-xl font-semibold italic">
          🍅 Nonna Mia
        </div>
      </header>
      <main className="mx-auto max-w-lg px-5 pb-4 pt-5">
        <InstallPrompt />
        <Outlet />
      </main>
      <nav className="app-nav">
        <div className="mx-auto flex max-w-lg">
          <NavItem to="/" end icon="book" label="Recettes" />
          <NavItem to="/famiglie" icon="users" label="Familles" />
          <button
            className={itemClass({ isActive: false })}
            onClick={() => supabase.auth.signOut()}
          >
            <Icon name="logout" />
            Quitter
          </button>
        </div>
      </nav>
    </div>
  );
}
