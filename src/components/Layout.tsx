import { Link, Outlet, useLocation } from "react-router-dom";
import InstallPrompt from "./InstallPrompt";
import AccountMenu from "./AccountMenu";
import { Icon, type IconName } from "./Icons";
import Tomato from "./Tomato";

const Tab = ({
  to,
  icon,
  label,
  active,
}: {
  to: string;
  icon: IconName;
  label: string;
  active: boolean;
}) => (
  <Link
    to={to}
    aria-current={active ? "page" : undefined}
    className={`tab ${active ? "is-active" : ""}`}
  >
    <Icon name={icon} size={22} />
    {label}
  </Link>
);

export default function Layout() {
  const path = useLocation().pathname;
  const editing = /^\/recettes\/(nouvelle|[^/]+\/modifier)$/.test(path);

  return (
    <div className="min-h-dvh">
      <header className="app-header">
        <div className="mx-auto grid h-16 max-w-lg grid-cols-[2.25rem_1fr_2.25rem] items-center px-4">
          <span />
          <Link to="/" className="flex items-center justify-center gap-2">
            <span className="flex flex-col items-start">
              <span className="font-display text-[1.3rem] leading-none font-semibold italic">
                Nonna’s Kitchen
              </span>
              <span className="mt-1 text-[0.625rem] font-bold uppercase tracking-[0.26em] text-brass-light">
                Cucina di famiglia
              </span>
            </span>
          </Link>
          <AccountMenu />
        </div>
        <div className="gingham-band" />
      </header>
      <main
        className={`mx-auto max-w-lg px-5 pt-6 ${editing ? "pb-10" : "pb-[calc(env(safe-area-inset-bottom)+7rem)]"}`}
      >
        <InstallPrompt />
        <Outlet />
      </main>
      {!editing && (
        <nav className="tabbar" aria-label="Navigation principale">
          <div className="gingham-band" />
          <div className="mx-auto grid max-w-lg grid-cols-[1fr_auto_1fr] items-center px-6">
            <Tab
              to="/"
              icon="book"
              label="Recettes"
              active={path === "/" || path.startsWith("/recettes/")}
            />
            <Link
              to="/recettes/nouvelle"
              className="tab-add"
              aria-label="Ajouter une recette"
            >
              <span className="tab-add-btn">
                <Icon name="plus" size={28} />
              </span>
            </Link>
            <Tab
              to="/famiglie"
              icon="users"
              label="Familles"
              active={path.startsWith("/famiglie")}
            />
          </div>
        </nav>
      )}
    </div>
  );
}
