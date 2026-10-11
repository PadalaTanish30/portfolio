/**
 * URL ⇄ state mapping for the anime/manga explorer.
 *
 * Kept out of the component so the parsing rules are unit-testable in the
 * node-based Vitest setup, and so the URL contract lives in exactly one place.
 * The module is pure: no DOM, no React.
 */
import type { MediaStatus } from "@/lib/types";

/** Sort orders offered by the explorer. */
export const EXPLORER_SORTS = [
  "default",
  "progress",
  "score",
  "title",
  "year",
] as const;

export type ExplorerSort = (typeof EXPLORER_SORTS)[number];

/** Status filter value, including the "all" sentinel. */
export type ExplorerStatus = MediaStatus | "all";

export type ExplorerState = {
  status: ExplorerStatus;
  sort: ExplorerSort;
  query: string;
};

export const DEFAULT_EXPLORER_STATE: ExplorerState = {
  status: "all",
  sort: "default",
  query: "",
};

/** Longest search string we will round-trip through the URL. */
const MAX_QUERY_LENGTH = 100;

export function isExplorerSort(value: unknown): value is ExplorerSort {
  return (EXPLORER_SORTS as readonly unknown[]).includes(value);
}

/**
 * Read explorer state from a location search string (with or without the
 * leading "?"). Unknown params, unknown statuses and unknown sorts are
 * discarded, so a hand-edited or hostile URL can never break the list.
 *
 * `statuses` is the set allowed for the current page — anime has no "reading",
 * manga has no "watching" — so a status that doesn't apply falls back to "all".
 */
export function parseExplorerSearch(
  search: string,
  statuses: readonly MediaStatus[],
): ExplorerState {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  const rawStatus = params.get("status");
  const status: ExplorerStatus =
    rawStatus !== null &&
    (rawStatus === "all" || (statuses as readonly string[]).includes(rawStatus))
      ? (rawStatus as ExplorerStatus)
      : "all";

  const rawSort = params.get("sort");
  const sort: ExplorerSort = isExplorerSort(rawSort) ? rawSort : "default";

  const query = (params.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);

  return { status, sort, query };
}

/**
 * Serialise explorer state back to a location search string. Defaults are
 * omitted so the common case stays a clean URL, and params are written in a
 * stable order so the result compares equal to the current location.
 */
export function buildExplorerSearch(state: ExplorerState): string {
  const params = new URLSearchParams();
  if (state.status !== "all") params.set("status", state.status);
  if (state.sort !== "default") params.set("sort", state.sort);
  const query = state.query.slice(0, MAX_QUERY_LENGTH);
  if (query) params.set("q", query);

  const search = params.toString();
  return search ? `?${search}` : "";
}
