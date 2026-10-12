import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const variants = {
  neutral: "border-border bg-surface-muted text-muted",
  primary: "border-primary/40 bg-primary/10 text-primary",
  success:
    "border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning:
    "border-amber-600/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "border-rose-600/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  info: "border-sky-600/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  purple:
    "border-violet-600/30 bg-violet-500/10 text-violet-700 dark:text-violet-400",
} as const;

export type BadgeVariant = keyof typeof variants;

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
