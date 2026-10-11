import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFeed } from "@/lib/feeds";
import { getArticles, getUpdates } from "@/lib/articles";

const state = vi.hoisted(() => ({
  feedSources: [
    { name: "Good", url: "https://good.example/feed", enabled: true },
    { name: "Bad", url: "https://bad.example/feed", enabled: true },
    { name: "Off", url: "https://off.example/feed", enabled: false },
  ],
  updates: [
    {
      id: "u1",
      title: "Update one",
      date: "2026-01-01T00:00:00.000Z",
      kind: "blog",
    },
    {
      id: "u2",
      title: "Update two",
      date: "2026-06-01T00:00:00.000Z",
      kind: "note",
      url: "https://x.example/u2",
      pinned: true,
    },
    {
      id: "u3",
      title: "Update three",
      date: "2025-01-01T00:00:00.000Z",
      kind: "release",
      pinned: true,
    },
  ],
}));

vi.mock("@/data/feeds", () => ({
  feedSources: state.feedSources,
  MAX_ARTICLES: 3,
}));
vi.mock("@/data/updates", () => ({ updates: state.updates }));
vi.mock("@/lib/feeds", () => ({ fetchFeed: vi.fn() }));

const mockFetchFeed = vi.mocked(fetchFeed);

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  mockFetchFeed.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  // Restore the default enable flags for the next test.
  state.feedSources[0].enabled = true;
  state.feedSources[1].enabled = true;
  state.feedSources[2].enabled = false;
});

describe("getArticles", () => {
  it("merges feeds and manual updates newest-first, capping at MAX_ARTICLES", async () => {
    mockFetchFeed.mockImplementation(async (source) => {
      if (source.name === "Bad") throw new Error("boom");
      return [
        {
          title: "A",
          url: "https://good.example/a",
          source: "Good",
          publishedAt: "2026-03-01T00:00:00.000Z",
        },
        {
          title: "B",
          url: "https://good.example/b",
          source: "Good",
          publishedAt: "2026-07-01T00:00:00.000Z",
        },
      ];
    });

    const result = await getArticles();

    expect(result.hasFeeds).toBe(true);
    expect(result.errors).toEqual(["Bad: boom"]);
    // Sorted: B (Jul) → Update two (Jun) → A (Mar); MAX_ARTICLES = 3.
    expect(result.articles.map((a) => a.title)).toEqual([
      "B",
      "Update two",
      "A",
    ]);
  });

  it("never throws and still surfaces the manual updates when a feed fails", async () => {
    mockFetchFeed.mockImplementation(async (source) => {
      if (source.name === "Bad") throw new Error("network down");
      return [];
    });

    const result = await getArticles();
    expect(result.errors).toEqual(["Bad: network down"]);
    expect(result.articles.map((a) => a.title)).toContain("Update one");
  });

  it("returns only manual updates when no feeds are enabled", async () => {
    state.feedSources[0].enabled = false;
    state.feedSources[1].enabled = false;

    const result = await getArticles();

    expect(result.hasFeeds).toBe(false);
    expect(result.errors).toEqual([]);
    expect(mockFetchFeed).not.toHaveBeenCalled();
    expect(result.articles.map((a) => a.title)).toEqual([
      "Update two",
      "Update one",
      "Update three",
    ]);

    const manual = result.articles.find((a) => a.title === "Update one");
    expect(manual).toMatchObject({
      url: "/articles",
      source: "Update",
      platform: "blog",
    });
  });
});

describe("getUpdates", () => {
  it("lists pinned updates first, then newest-first", () => {
    // u2 and u3 are pinned (u3 is the oldest), u1 is not.
    expect(getUpdates().map((u) => u.title)).toEqual([
      "Update two",
      "Update three",
      "Update one",
    ]);
  });
});
