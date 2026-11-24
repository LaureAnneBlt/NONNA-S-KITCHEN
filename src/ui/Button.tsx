import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { cn } from "./cn";

const VARIANTS = {
  primary: "bg-primary text-on-primary shadow-btn active:bg-primary-press",
  secondary: "border border-line-strong bg-surface text-fg active:bg-sunken",
  /** Bouton clair posé sur une photo. */
  overlay: "bg-surface active:bg-sunken",
  /** Action destructrice discrète, sans fond. */
  danger: "h-11 px-4 text-sm text-primary active:scale-100 active:bg-primary/8",
};
const SIZES = {
  md: "h-12 px-6",
  sm: "h-10 px-4 text-sm",
  xs: "h-9 gap-1.5 px-3.5 text-sm",
  stretch: "h-auto px-5",
};

export type ButtonStyle = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
};

const buttonClass = (
  { variant = "primary", size = "md" }: ButtonStyle,
  className?: string,
) =>
  cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50",
    SIZES[size],
    VARIANTS[variant],
    className,
  );

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonStyle & ComponentPropsWithoutRef<"button">
>(function Button({ variant, size, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={buttonClass({ variant, size }, className)}
      {...props}
    />
  );
});

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ButtonStyle & LinkProps) {
  return (
    <Link className={buttonClass({ variant, size }, className)} {...props} />
  );
}

const ICON_VARIANTS = {
  ghost: "text-muted active:bg-line",
  outlined: "border border-line-strong bg-surface text-fg active:bg-sunken",
};

/** Bouton rond avec seulement une icône : `label` est lu par les lecteurs d'écran. */
export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  className,
  ...props
}: {
  label: string;
  variant?: keyof typeof ICON_VARIANTS;
  size?: "md" | "sm";
} & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "grid shrink-0 place-items-center rounded-full transition active:scale-95",
        size === "md" ? "size-10" : "size-9",
        ICON_VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}

/** Lien ou bouton qui ressemble à du texte souligné. */
export function TextButton({
  strong,
  className,
  ...props
}: { strong?: boolean } & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "underline underline-offset-2",
        strong && "font-semibold text-primary underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}
