"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { MediaEntry, MediaStatus } from "@/lib/types";
import { MediaCard } from "@/components/media-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

type SortKey = "default" | "title" | "score" | "progress" | "year";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "progress", label: "Progress" },
  { value: "score", label: "Score" },
  { value: "title", label: "Title A–Z" },
  { value: "year", label: "Newest" },
];

function isSortKey(value: string): value is SortKey {
  return SORTS.some((option) => option.value === value);
}

export function MediaExplorer({
  entries,
  statusFilters,
}: {
  entries: MediaEntry[];
  statusFilters?: { value: MediaStatus; label: string }[];
}) {
  const [status, setStatus] = useState<MediaStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("default");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let result = entries;

    if (status !== "all") {
      result = result.filter((entry) => entry.status === status);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.titleAlt?.toLowerCase().includes(q) === true,
      );
    }

    const sorted = [...result];
    switch (sort) {
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "score":
        sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
      case "progress":
        sorted.sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
        break;
      case "year":
        sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
      default:
        break;
    }
    return sorted;
  }, [entries, status, sort, query]);

  const filters = statusFilters ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Filter by status"
        >
          <FilterChip
            active={status === "all"}
            onClick={() => setStatus("all")}
          >
            All
          </FilterChip>
          {filters.map((filter) => (
            <FilterChip
              key={filter.value}
              active={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="relative flex-1 sm:flex-none">
            <span className="sr-only">Search titles</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              name="search"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              className="h-9 w-full rounded-full border border-border bg-surface pl-9 pr-3 text-sm outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-44"
            />
          </label>
          <label className="relative">
            <span className="sr-only">Sort entries</span>
            <ArrowUpDown
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <select
              value={sort}
              onChange={(event) => {
                if (isSortKey(event.target.value)) setSort(event.target.value);
              }}
              className="h-9 appearance-none rounded-full border border-border bg-surface pl-8 pr-8 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try a different filter or search term."
        />
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {filtered.map((entry) => (
            <MediaCard key={`${entry.id}`} entry={entry} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
