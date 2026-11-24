import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "./cn";

export function Eyebrow({
  className,
  ...props
}: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      className={cn(
        "text-[0.75rem] font-bold uppercase tracking-[0.16em] text-primary",
        className,
      )}
      {...props}
    />
  );
}

export function PageTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      className={cn(
        "font-display text-[2.125rem] leading-[1.05] font-semibold italic tracking-[-0.015em] text-balance",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "font-display text-[1.25rem] leading-tight font-semibold",
        className,
      )}
      {...props}
    />
  );
}

/** Titre de rubrique façon menu de trattoria, encadré de deux filets dorés. */
export function MenuHeading({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      className={cn(
        "flex items-center justify-center gap-[0.6rem] font-display text-sm font-semibold uppercase tracking-[0.2em] text-wood",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="h-px max-w-18 flex-1 bg-linear-to-r from-transparent to-brass"
      />
      {children}
      <span
        aria-hidden="true"
        className="h-px max-w-18 flex-1 bg-linear-to-r from-brass to-transparent"
      />
    </h2>
  );
}

type LabelProps<T extends ElementType> = { as?: T } & Omit<
  ComponentPropsWithoutRef<T>,
  "as"
>;

export function Label<T extends ElementType = "label">({
  as,
  className,
  ...props
}: LabelProps<T>) {
  const Tag: ElementType = as ?? "label";
  return (
    <Tag
      className={cn(
        "mb-1.5 block text-[0.75rem] font-bold uppercase tracking-widest text-wood",
        className,
      )}
      {...props}
    />
  );
}

export function StepNumber({
  className,
  ...props
}: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "font-display text-[1.375rem] leading-none font-semibold italic text-primary",
        className,
      )}
      {...props}
    />
  );
}
