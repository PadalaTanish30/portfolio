"use client";

import { useMemo, useSyncExternalStore, type ReactNode } from "react";
import { ArrowUpDown, Search } from "lucide-react";
import type { MediaEntry, MediaStatus } from "@/lib/types";
import {
  buildExplorerSearch,
  isExplorerSort,
  parseExplorerSearch,
  type ExplorerSort,
  type ExplorerState,
} from "@/lib/explorer-query";
import { MediaCard } from "@/components/media-card";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

const SORTS: { value: ExplorerSort; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "progress", label: "Progress" },
  { value: "score", label: "Score" },
  { value: "title", label: "Title A–Z" },
  { value: "year", label: "Newest" },
];

/* -------------------------------------------------------------------------- */
/*  The query string is the store                                             */
/* -------------------------------------------------------------------------- */
/*
 * Filters live in the URL so a filtered view is shareable and the back/forward
 * buttons behave. Keeping the URL as the single source of truth (read through
 * `useSyncExternalStore`) avoids `useSearchParams` — which would force a
 * Suspense boundary and a router round-trip on every keystroke — so the page
 * stays statically prerenderable and the list stays instant.
 */

const listeners = new Set<() => void>();

function subscribeToUrl(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

/** `replaceState` does not fire `popstate`, so notify subscribers ourselves. */
function replaceSearch(next: string) {
  const { pathname, hash } = window.location;
  window.history.replaceState(null, "", `${pathname}${next}${hash}`);
  for (const listener of listeners) listener();
}

const getUrlSearch = () => window.location.search;
/** On the server (and during hydration) there is no URL — render defaults. */
const getServerSearch = () => "";

export function MediaExplorer({
  entries,
  statusFilters,
}: {
  entries: MediaEntry[];
  statusFilters?: { value: MediaStatus; label: string }[];
}) {
  const allowedStatuses = useMemo(
    () => (statusFilters ?? []).map((filter) => filter.value),
    [statusFilters],
  );

  const search = useSyncExternalStore(
    subscribeToUrl,
    getUrlSearch,
    getServerSearch,
  );

  const { status, sort, query } = useMemo(
    () => parseExplorerSearch(search, allowedStatuses),
    [search, allowedStatuses],
  );

  const update = (patch: Partial<ExplorerState>) => {
    replaceSearch(buildExplorerSearch({ status, sort, query, ...patch }));
  };

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
            onClick={() => update({ status: "all" })}
          >
            All
          </FilterChip>
          {filters.map((filter) => (
            <FilterChip
              key={filter.value}
              active={status === filter.value}
              onClick={() => update({ status: filter.value })}
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
              onChange={(event) => update({ query: event.target.value })}
              placeholder="Search…"
              className="h-9 w-full rounded-sm border border-border bg-surface pl-9 pr-3 text-sm outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-44"
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
                if (isExplorerSort(event.target.value))
                  update({ sort: event.target.value });
              }}
              className="h-9 appearance-none rounded-sm border border-border bg-surface pl-8 pr-8 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
        "rounded-sm border px-3 py-1.5 text-xs font-medium transition-[background-color,border-color,color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
