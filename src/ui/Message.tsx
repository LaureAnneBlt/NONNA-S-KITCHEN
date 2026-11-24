import type { ReactNode } from "react";
import { cn } from "./cn";

export function Message({
  tone = "error",
  className,
  children,
}: {
  tone?: "error" | "success";
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "text-sm font-semibold",
        tone === "error" ? "text-primary" : "text-accent",
        className,
      )}
    >
      {children}
    </p>
  );
}
