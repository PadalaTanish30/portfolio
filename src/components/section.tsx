import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function SectionHeading({
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
    <div className={cn("mb-5", className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {typeof count === "number" ? (
          <span className="text-sm tabular-nums text-muted">{count}</span>
        ) : null}
        <span
          className="hidden h-px flex-1 self-center bg-border sm:block"
          aria-hidden="true"
        />
        {action ? <div className="ml-auto">{action}</div> : null}
      </div>
      {description ? (
        <p className="mt-1 text-sm text-muted">{description}</p>
      ) : null}
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
