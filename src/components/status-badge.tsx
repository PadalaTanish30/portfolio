import type { GameStatus, MediaStatus } from "@/lib/types";
import { Badge, type BadgeVariant } from "@/components/badge";

type AnyStatus = MediaStatus | GameStatus;

const STATUS_META: Record<AnyStatus, { label: string; variant: BadgeVariant }> =
  {
    watching: { label: "Watching", variant: "success" },
    reading: { label: "Reading", variant: "success" },
    playing: { label: "Playing", variant: "success" },
    completed: { label: "Completed", variant: "info" },
    plan: { label: "Plan to watch/read", variant: "primary" },
    backlog: { label: "Backlog", variant: "primary" },
    on_hold: { label: "On hold", variant: "warning" },
    dropped: { label: "Dropped", variant: "danger" },
  };

export function StatusBadge({
  status,
  className,
}: {
  status: AnyStatus;
  className?: string;
}) {
  const meta = STATUS_META[status] ?? {
    label: status,
    variant: "neutral" as const,
  };
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.label}
    </Badge>
  );
}
