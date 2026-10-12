import Image from "next/image";
import { Clock, ExternalLink, Star } from "lucide-react";
import type { Game } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { cn, formatScore } from "@/lib/utils";

export function GameCard({
  game,
  className,
}: {
  game: Game;
  className?: string;
}) {
  const score = formatScore(game.score);

  return (
    <li
      data-tilt
      className={cn(
        "group flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-card)] transition-[box-shadow,border-color] hover:border-primary hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
        {game.coverImage ? (
          <Image
            src={game.coverImage}
            alt={`Cover art for ${game.title}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">
            No cover
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/40 to-transparent"
        />
        <div className="absolute left-2 top-2">
          <StatusBadge status={game.status} variant="sticker" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold leading-snug">
          {game.link ? (
            <a
              href={game.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1 hover:text-primary"
            >
              <span>{game.title}</span>
              <ExternalLink
                className="mt-0.5 h-3 w-3 shrink-0 opacity-50"
                aria-hidden="true"
              />
            </a>
          ) : (
            game.title
          )}
        </h3>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span className="font-medium text-foreground">{game.platform}</span>
          {game.hoursPlayed !== undefined ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {game.hoursPlayed}h
            </span>
          ) : null}
          {score ? (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star
                className="h-3 w-3 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              {score}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
