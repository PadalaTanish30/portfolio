import { cn } from "@/lib/utils";
import { percent } from "@/lib/utils";

export function ProgressBar({
  value,
  total,
  className,
  label,
}: {
  value?: number;
  total?: number;
  className?: string;
  label?: string;
}) {
  const pct = percent(value, total);
  if (!total || total <= 0) return null;

  return (
    <div className={cn("space-y-1", className)}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-sm bg-surface-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div
          className="h-full rounded-sm bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
