import type { ReactNode } from "react";
import { cn } from "./cn";

export function Ornament({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center gap-[0.6rem] text-brass", className)}
    >
      <span className="h-px flex-1 bg-current opacity-70" />
      <span className="size-1.25 rotate-45 bg-current" />
      <span className="h-px flex-1 bg-current opacity-70" />
    </div>
  );
}

export function Rule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-px bg-linear-to-r from-transparent via-brass to-transparent",
        className,
      )}
    />
  );
}

export function Leader() {
  return (
    <span
      aria-hidden="true"
      className="min-w-4 flex-1 translate-y-[-0.3em] border-b-[1.5px] border-dotted border-wood/45"
    />
  );
}

export function Plate({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "grid size-17 place-items-center rounded-full bg-surface shadow-plate",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GinghamBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-2.5 bg-gingham [--gingham-alpha:42%] [--gingham-size:10px]",
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-line", className)} />;
}
