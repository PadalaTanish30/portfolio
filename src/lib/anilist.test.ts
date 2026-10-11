import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { animeFallback } from "@/data/anime";
import { mangaFallback } from "@/data/manga";
import {
  getAnimeList,
  getMangaList,
  isAnimeSyncConfigured,
} from "@/lib/anilist";

/** Minimal stand-in for the parts of `Response` the AniList/Jikan clients read. */
function jsonResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as unknown as Response;
}

function anilistBody(entries: unknown[]) {
  return { data: { MediaListCollection: { lists: [{ entries }] } } };
}

beforeEach(() => {
  // Sync failures are expected in several tests — keep the output clean.
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getAnimeList — AniList source", () => {
  it("maps entries, preferring the english title and extraLarge cover", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          anilistBody([
            {
              status: "CURRENT",
              score: 95,
              progress: 7,
              media: {
                id: 1,
                title: {
                  romaji: "Romaji",
                  english: "English",
                  native: "Native",
                },
                coverImage: {
                  large: "https://img/l.jpg",
                  extraLarge: "https://img/xl.jpg",
                },
                format: "TV",
                seasonYear: 2024,
                episodes: 24,
                genres: ["Action"],
                siteUrl: "https://anilist.co/anime/1",
                isFavourite: true,
              },
            },
          ]),
        ),
      ),
    );

    const { entries, source } = await getAnimeList();
    expect(source).toBe("anilist");
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      id: 1,
      title: "English",
      titleAlt: "Romaji",
      coverImage: "https://img/xl.jpg",
      status: "watching",
      score: 95,
      progress: 7,
      total: 24,
      year: 2024,
      link: "https://anilist.co/anime/1",
      favourite: true,
    });
  });

  it("treats an empty but successful response as authoritative", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse(anilistBody([]))),
    );
    const { entries, source } = await getAnimeList();
    expect(source).toBe("anilist");
    expect(entries).toEqual([]);
  });

  it("neutralises dangerous image URLs but keeps the entry", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          anilistBody([
            {
              status: "CURRENT",
              media: {
                id: 2,
                title: { romaji: "A" },
                coverImage: { large: "javascript:alert(1)" },
              },
            },
            {
              status: "CURRENT",
              media: {
                id: 3,
                title: { romaji: "B" },
                coverImage: { large: "/local.png" },
              },
            },
          ]),
        ),
      ),
    );
    const { entries } = await getAnimeList();
    expect(entries).toHaveLength(2);
    expect(entries[0]?.coverImage).toBeUndefined();
    expect(entries[1]?.coverImage).toBe("/local.png");
  });

  it("neutralises a mailto link from the API (mailto is not allowed for API values)", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          anilistBody([
            {
              status: "CURRENT",
              media: {
                id: 9,
                title: { romaji: "M" },
                siteUrl: "mailto:x@y.com",
              },
            },
          ]),
        ),
      ),
    );
    const { entries } = await getAnimeList();
    expect(entries).toHaveLength(1);
    expect(entries[0]?.link).toBeUndefined();
  });

  it("omits a zero score", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(
          anilistBody([
            {
              status: "COMPLETED",
              score: 0,
              media: { id: 4, title: { romaji: "Zero" } },
            },
          ]),
        ),
      ),
    );
    const { entries } = await getAnimeList();
    expect(entries[0]?.score).toBeUndefined();
    expect(entries[0]?.status).toBe("completed");
  });

  it("skips entries that have no media at all", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse(anilistBody([{ status: "CURRENT", media: null }])),
      ),
    );
    const { entries, source } = await getAnimeList();
    expect(source).toBe("anilist");
    expect(entries).toEqual([]);
  });

  it("falls back to local data when AniList reports an error", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ errors: [{ message: "Not found" }] })),
    );
    const { entries, source } = await getAnimeList();
    expect(source).toBe("fallback");
    expect(entries).toEqual(animeFallback);
  });

  it("falls back to local data on a non-OK status", async () => {
    vi.stubEnv("ANILIST_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, 404)),
    );
    const { entries, source } = await getAnimeList();
    expect(source).toBe("fallback");
    expect(entries).toEqual(animeFallback);
  });
});

describe("getMangaList — Jikan source", () => {
  it("maps Jikan entries and scales the score to 0–100", async () => {
    vi.stubEnv("ANILIST_USERNAME", "");
    vi.stubEnv("MAL_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          data: [
            {
              entry: {
                mal_id: 42,
                title: "Berserk",
                images: { jpg: { large_image_url: "https://cdn/berserk.jpg" } },
                url: "https://myanimelist.net/manga/42",
                chapters: 364,
                genres: [{ name: "Action" }, { name: "Drama" }],
                year: 1989,
              },
              score: 9.5,
              progress: 100,
              status: "reading",
            },
          ],
        }),
      ),
    );

    const { entries, source } = await getMangaList();
    expect(source).toBe("jikan");
    expect(entries[0]).toMatchObject({
      id: "mal-42",
      title: "Berserk",
      coverImage: "https://cdn/berserk.jpg",
      status: "reading",
      score: 95,
      progress: 100,
      total: 364,
      genres: ["Action", "Drama"],
      year: 1989,
    });
  });

  it('maps the "Plan to Read" status to plan', async () => {
    vi.stubEnv("ANILIST_USERNAME", "");
    vi.stubEnv("MAL_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          data: [{ entry: { mal_id: 7, title: "X" }, status: "Plan to Read" }],
        }),
      ),
    );
    const { entries } = await getMangaList();
    expect(entries[0]?.status).toBe("plan");
  });

  it("falls back to local data when Jikan fails", async () => {
    vi.stubEnv("ANILIST_USERNAME", "");
    vi.stubEnv("MAL_USERNAME", "someone");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({}, 500)),
    );
    const { entries, source } = await getMangaList();
    expect(source).toBe("fallback");
    expect(entries).toEqual(mangaFallback);
  });
});

describe("sync configuration", () => {
  it("uses local data and never calls fetch when no source is configured", async () => {
    vi.stubEnv("ANILIST_USERNAME", "");
    vi.stubEnv("MAL_USERNAME", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { entries, source } = await getAnimeList();
    expect(source).toBe("fallback");
    expect(entries).toEqual(animeFallback);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports whether a username is configured", () => {
    vi.stubEnv("MAL_USERNAME", "");
    vi.stubEnv("ANILIST_USERNAME", "someone");
    expect(isAnimeSyncConfigured()).toBe(true);

    vi.stubEnv("ANILIST_USERNAME", "");
    expect(isAnimeSyncConfigured()).toBe(false);
  });
});
