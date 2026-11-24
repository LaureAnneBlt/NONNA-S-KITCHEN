import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "./cn";

type CardProps<T extends ElementType> = {
  as?: T;
  /** Filet doré à l'intérieur, comme sur une carte de menu. */
  menu?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Card<T extends ElementType = "div">({
  as,
  menu,
  className,
  children,
  ...props
}: CardProps<T>) {
  const Tag: ElementType = as ?? "div";
  return (
    <Tag
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-card",
        menu && "relative",
        className,
      )}
      {...props}
    >
      {menu && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[5px] rounded-[0.8rem] border border-brass/45"
        />
      )}
      {children}
    </Tag>
  );
}
