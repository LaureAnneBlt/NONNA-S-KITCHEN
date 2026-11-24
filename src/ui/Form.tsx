import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { cn } from "./cn";
import { Icon } from "./Icon";
import { Label } from "./Typography";

const FIELD =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-base leading-snug outline-none transition placeholder:text-subtle focus:border-primary focus:ring-[3px] focus:ring-primary/12";

export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithoutRef<"input">
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(FIELD, className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<"textarea">
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(FIELD, "resize-none overflow-hidden", className)}
      {...props}
    />
  );
});

export function Select({
  className,
  ...props
}: ComponentPropsWithoutRef<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select className={cn(FIELD, "appearance-none pr-9")} {...props} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-wood">
        <Icon name="chevron" size={16} />
      </span>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
