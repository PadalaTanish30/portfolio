import Image from "next/image";
import { ExternalLink, Music2 } from "lucide-react";
import type { MusicEntry } from "@/lib/types";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";

export function MusicCard({
  entry,
  className,
}: {
  entry: MusicEntry;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "group flex items-center gap-4 rounded-2xl border border-border bg-surface p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-muted">
        {entry.coverImage ? (
          <Image
            src={entry.coverImage}
            alt={`Artwork for ${entry.title}`}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">
            <Music2 className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant={
              entry.type === "artist"
                ? "purple"
                : entry.type === "album"
                  ? "info"
                  : "neutral"
            }
          >
            {entry.type}
          </Badge>
          {entry.favourite ? <Badge variant="warning">Favourite</Badge> : null}
        </div>
        <p className="mt-1 truncate text-sm font-semibold">{entry.title}</p>
        <p className="truncate text-xs text-muted">
          {entry.artist}
          {entry.album ? ` · ${entry.album}` : ""}
        </p>
      </div>

      {entry.link ? (
        <a
          href={entry.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-full border border-border p-2 text-muted transition-colors hover:bg-surface-muted hover:text-primary"
          aria-label={`Listen to ${entry.title} (opens in a new tab)`}
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      ) : null}
    </li>
  );
}
