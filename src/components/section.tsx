import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeading({
  title,
  count,
  description,
  action,
  className,
}: {
  title: string;
  count?: number;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-3",
        className,
      )}
    >
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          {title}
          {typeof count === "number" ? (
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
              {count}
            </span>
          ) : null}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function Section({
  id,
  title,
  count,
  description,
  action,
  children,
  className,
}: {
  id?: string;
  title?: string;
  count?: number;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24", className)}>
      {title ? (
        <SectionHeading
          title={title}
          count={count}
          description={description}
          action={action}
        />
      ) : null}
      {children}
    </section>
  );
}
