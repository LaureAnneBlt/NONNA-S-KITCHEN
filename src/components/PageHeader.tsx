import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "./Icons";

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col items-center gap-2 text-center">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title">{title}</h1>
      <div className="ornament w-24">
        <i />
      </div>
      {children && (
        <p className="max-w-[20rem] text-[0.9375rem] text-muted">{children}</p>
      )}
    </header>
  );
}

export function TopBar({
  to,
  label,
  children,
}: {
  to: string;
  label: string;
  children?: ReactNode;
}) {
  return (
    <div className="-mt-1 flex min-h-10 items-center justify-between gap-2">
      <Link
        to={to}
        className="-ml-2 flex items-center gap-0.5 rounded-full py-2 pl-1 pr-3 text-sm font-semibold text-muted active:bg-line"
      >
        <Icon name="back" size={20} />
        {label}
      </Link>
      {children && <div className="flex items-center gap-1">{children}</div>}
    </div>
  );
}
