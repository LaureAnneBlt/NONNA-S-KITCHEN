import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "./cn";

/** Pastille cliquable (filtre, choix multiple). `on` la colore en vert. */
export function Chip({
  on,
  className,
  ...props
}: { on?: boolean } & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-medium text-muted transition active:scale-[0.97]",
        className,
        on && "border-accent bg-accent text-on-primary",
      )}
      {...props}
    />
  );
}

type TagProps<T extends ElementType> = {
  as?: T;
  muted?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Petite étiquette non cliquable (famille, « Privée »…). */
export function Tag<T extends ElementType = "span">({
  as,
  muted,
  className,
  ...props
}: TagProps<T>) {
  const El: ElementType = as ?? "span";
  return (
    <El
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent",
        muted && "bg-line text-muted",
        className,
      )}
      {...props}
    />
  );
}
