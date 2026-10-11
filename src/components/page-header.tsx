import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 pb-8 sm:pb-10", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-sm font-medium text-primary">{eyebrow}</p>
          ) : null}
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h1>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {description ? (
        <div className="max-w-2xl text-base leading-relaxed text-pretty text-muted">
          {description}
        </div>
      ) : null}
    </header>
  );
}
