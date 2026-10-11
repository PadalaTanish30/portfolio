import { describe, expect, it } from "vitest";
import {
  DEFAULT_EXPLORER_STATE,
  buildExplorerSearch,
  isExplorerSort,
  parseExplorerSearch,
} from "@/lib/explorer-query";
import type { MediaStatus } from "@/lib/types";

const ANIME: readonly MediaStatus[] = [
  "watching",
  "completed",
  "plan",
  "on_hold",
  "dropped",
];
const MANGA: readonly MediaStatus[] = [
  "reading",
  "completed",
  "plan",
  "on_hold",
  "dropped",
];

describe("isExplorerSort", () => {
  it("accepts known sorts and rejects everything else", () => {
    expect(isExplorerSort("score")).toBe(true);
    expect(isExplorerSort("default")).toBe(true);
    expect(isExplorerSort("bogus")).toBe(false);
    expect(isExplorerSort(null)).toBe(false);
    expect(isExplorerSort(undefined)).toBe(false);
    expect(isExplorerSort(3)).toBe(false);
  });
});

describe("parseExplorerSearch", () => {
  it("returns defaults for an empty search", () => {
    expect(parseExplorerSearch("", ANIME)).toEqual(DEFAULT_EXPLORER_STATE);
    expect(parseExplorerSearch("?", ANIME)).toEqual(DEFAULT_EXPLORER_STATE);
  });

  it("accepts the search with or without a leading question mark", () => {
    expect(parseExplorerSearch("status=completed", ANIME).status).toBe(
      "completed",
    );
    expect(parseExplorerSearch("?status=completed", ANIME).status).toBe(
      "completed",
    );
  });

  it("reads status, sort and query", () => {
    expect(
      parseExplorerSearch("?status=watching&sort=score&q=naruto", ANIME),
    ).toEqual({ status: "watching", sort: "score", query: "naruto" });
  });

  it("keeps the explicit 'all' sentinel", () => {
    expect(parseExplorerSearch("?status=all", ANIME).status).toBe("all");
  });

  it("drops a status that is not allowed on this page", () => {
    // "reading" is valid for manga but not anime.
    expect(parseExplorerSearch("?status=reading", ANIME).status).toBe("all");
    expect(parseExplorerSearch("?status=reading", MANGA).status).toBe(
      "reading",
    );
    expect(parseExplorerSearch("?status=watching", ANIME).status).toBe(
      "watching",
    );
  });

  it("falls back to 'all' when no statuses are allowed", () => {
    expect(parseExplorerSearch("?status=completed", []).status).toBe("all");
  });

  it("drops an unknown status and unknown sort", () => {
    const parsed = parseExplorerSearch("?status=👾&sort=sideways", ANIME);
    expect(parsed).toEqual(DEFAULT_EXPLORER_STATE);
  });

  it("ignores unknown params", () => {
    const parsed = parseExplorerSearch("?utm_source=x&sort=title", ANIME);
    expect(parsed.sort).toBe("title");
    expect(parsed).toEqual({ ...DEFAULT_EXPLORER_STATE, sort: "title" });
  });

  it("decodes '+' and percent-encoding in the query", () => {
    expect(parseExplorerSearch("?q=full+metal", ANIME).query).toBe(
      "full metal",
    );
    expect(parseExplorerSearch("?q=a%2Bb", ANIME).query).toBe("a+b");
    expect(parseExplorerSearch("?q=caf%C3%A9", ANIME).query).toBe("café");
  });

  it("caps an over-long query", () => {
    const parsed = parseExplorerSearch(`?q=${"x".repeat(500)}`, ANIME);
    expect(parsed.query).toHaveLength(100);
  });
});

describe("buildExplorerSearch", () => {
  it("returns an empty string for the default state", () => {
    expect(buildExplorerSearch(DEFAULT_EXPLORER_STATE)).toBe("");
    expect(
      buildExplorerSearch({ status: "all", sort: "default", query: "" }),
    ).toBe("");
  });

  it("omits default values but keeps the rest", () => {
    expect(
      buildExplorerSearch({ status: "plan", sort: "default", query: "" }),
    ).toBe("?status=plan");
    expect(
      buildExplorerSearch({ status: "all", sort: "title", query: "dune" }),
    ).toBe("?sort=title&q=dune");
  });

  it("writes params in a stable order", () => {
    expect(
      buildExplorerSearch({
        status: "completed",
        sort: "score",
        query: "naruto",
      }),
    ).toBe("?status=completed&sort=score&q=naruto");
  });

  it("encodes special characters in the query", () => {
    expect(
      buildExplorerSearch({ status: "all", sort: "default", query: "a+b" }),
    ).toBe("?q=a%2Bb");
    expect(
      buildExplorerSearch({ status: "all", sort: "default", query: "café" }),
    ).toBe("?q=caf%C3%A9");
  });

  it("caps an over-long query", () => {
    const built = buildExplorerSearch({
      status: "all",
      sort: "default",
      query: "y".repeat(200),
    });
    const value = new URLSearchParams(built).get("q");
    expect(value).toHaveLength(100);
  });

  it("round-trips through parseExplorerSearch", () => {
    for (const state of [
      { status: "plan" as const, sort: "year" as const, query: "elfen lied" },
      { status: "reading" as const, sort: "default" as const, query: "" },
      DEFAULT_EXPLORER_STATE,
    ]) {
      const search = buildExplorerSearch(state);
      const statuses =
        state.status === "reading" ? MANGA : (ANIME as readonly MediaStatus[]);
      expect(parseExplorerSearch(search, statuses)).toEqual(state);
    }
  });
});
