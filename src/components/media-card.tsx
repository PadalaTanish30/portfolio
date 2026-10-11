import Image from "next/image";
import { ExternalLink, Star } from "lucide-react";
import type { MediaEntry } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/progress-bar";
import { cn, formatProgress, formatScore } from "@/lib/utils";

export function MediaCard({
  entry,
  className,
}: {
  entry: MediaEntry;
  className?: string;
}) {
  const score = formatScore(entry.score);
  const progress = formatProgress(entry.progress, entry.total);

  return (
    <li
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-muted">
        {entry.coverImage ? (
          <Image
            src={entry.coverImage}
            alt={`Cover of ${entry.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-muted">
            No cover
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <StatusBadge status={entry.status} />
        </div>

        {entry.favourite ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-amber-300">
            <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            <span className="sr-only">Favourite</span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* h2: cards sit directly under the page h1 on /anime and /manga */}
        <h2 className="text-sm font-semibold leading-snug">
          {entry.link ? (
            <a
              href={entry.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-start gap-1 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className="line-clamp-2">{entry.title}</span>
              <ExternalLink
                className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60 group-focus-within:opacity-60"
                aria-hidden="true"
              />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : (
            <span className="line-clamp-2">{entry.title}</span>
          )}
        </h2>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-muted">
            {score ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                <Star
                  className="h-3 w-3 fill-amber-400 text-amber-400"
                  aria-hidden="true"
                />
                {score}
              </span>
            ) : (
              <span aria-hidden="true" />
            )}
            {progress ? <span>{progress}</span> : null}
          </div>
          {entry.format || entry.year ? (
            <p className="truncate text-xs text-muted">
              {[entry.format, entry.year].filter(Boolean).join(", ")}
            </p>
          ) : null}
          <ProgressBar
            value={entry.progress}
            total={entry.total}
            label={`${entry.title} progress`}
          />
        </div>
      </div>
    </li>
  );
}
