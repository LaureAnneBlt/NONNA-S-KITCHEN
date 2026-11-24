import { Link, Outlet, useLocation } from "react-router-dom";
import InstallPrompt from "./InstallPrompt";
import AccountMenu from "./AccountMenu";
import { cn, GinghamBand, Icon, type IconName } from "../ui";

const HEADER_SHINE =
  "[--planks-shade:linear-gradient(transparent_env(safe-area-inset-top),rgb(255_255_255/0.07)_env(safe-area-inset-top),transparent_60%)]";

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
    className={cn(
      "relative flex h-[3.6rem] flex-col items-center justify-center gap-[0.3rem] text-[0.6875rem] font-bold uppercase tracking-widest text-wood/82 transition-colors duration-200 active:scale-[0.96]",
      active && "text-primary",
    )}
  >
    <Icon name={icon} size={22} />
    {label}
    <span
      aria-hidden="true"
      className={cn(
        "absolute bottom-[0.3rem] size-1.25 rotate-45 scale-40 bg-brass opacity-0 transition duration-200",
        active && "scale-100 opacity-100",
      )}
    />
  </Link>
);

export default function Layout() {
  const path = useLocation().pathname;
  const editing = /^\/recettes\/(nouvelle|[^/]+\/modifier)$/.test(path);

  return (
    <div className="min-h-dvh">
      <header
        className={cn(
          "sticky top-0 z-20 bg-planks pt-[env(safe-area-inset-top)] text-on-primary shadow-header",
          HEADER_SHINE,
        )}
      >
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
        <GinghamBand className="shadow-band" />
      </header>
      <main
        className={`mx-auto max-w-lg px-5 pt-6 ${editing ? "pb-10" : "pb-[calc(env(safe-area-inset-bottom)+7rem)]"}`}
      >
        <InstallPrompt />
        <Outlet />
      </main>
      {!editing && (
        <nav
          className="fixed inset-x-0 bottom-0 z-20 bg-linear-to-b from-surface/96 to-canvas/96 pb-[env(safe-area-inset-bottom)] shadow-tabbar backdrop-blur-[14px]"
          aria-label="Navigation principale"
        >
          <GinghamBand className="h-2 shadow-hairline [--gingham-size:8px]" />
          <div className="mx-auto grid max-w-lg grid-cols-[1fr_auto_1fr] items-center px-6">
            <Tab
              to="/"
              icon="book"
              label="Recettes"
              active={path === "/" || path.startsWith("/recettes/")}
            />
            <Link
              to="/recettes/nouvelle"
              className="group mt-[-2.1rem] grid place-items-center px-5"
              aria-label="Ajouter une recette"
            >
              <span className="grid size-[3.6rem] place-items-center rounded-full bg-radial-[circle_at_50%_35%] from-tomato-400 via-primary via-60% to-primary-press text-on-primary shadow-fab transition-transform duration-150 group-active:scale-[0.94]">
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
