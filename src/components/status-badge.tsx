import type { GameStatus, MediaStatus } from "@/lib/types";
import { Badge, type BadgeVariant } from "@/components/badge";
import { cn } from "@/lib/utils";

type AnyStatus = MediaStatus | GameStatus;

const STATUS_META: Record<
  AnyStatus,
  { label: string; badge: BadgeVariant; dot: string }
> = {
  watching: { label: "Watching", badge: "success", dot: "bg-emerald-500" },
  reading: { label: "Reading", badge: "success", dot: "bg-emerald-500" },
  playing: { label: "Playing", badge: "success", dot: "bg-emerald-500" },
  completed: { label: "Completed", badge: "info", dot: "bg-sky-500" },
  plan: { label: "Planned", badge: "primary", dot: "bg-primary" },
  backlog: { label: "Backlog", badge: "primary", dot: "bg-primary" },
  on_hold: { label: "On hold", badge: "warning", dot: "bg-amber-500" },
  dropped: { label: "Dropped", badge: "danger", dot: "bg-rose-500" },
};

/**
 * `tint` is the low-key badge for use on our own surfaces.
 *
 * `sticker` is for overlaying cover art: a translucent-tint badge (10%
 * background) disappears against a busy poster, so the overlay version is a
 * near-opaque paper label with a colour-coded dot. That reads like a printed
 * sticker stuck onto the sleeve, and it stays legible on any artwork.
 */
export function StatusBadge({
  status,
  variant = "tint",
  className,
}: {
  status: AnyStatus;
  variant?: "tint" | "sticker";
  className?: string;
}) {
  const meta = STATUS_META[status] ?? {
    label: status,
    badge: "neutral" as const,
    dot: "bg-muted",
  };

  if (variant === "sticker") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm border border-black/10 bg-surface/95 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.35)] backdrop-blur-sm",
          className,
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
        {meta.label}
      </span>
    );
  }

  return (
    <Badge variant={meta.badge} className={className}>
      {meta.label}
    </Badge>
  );
}
