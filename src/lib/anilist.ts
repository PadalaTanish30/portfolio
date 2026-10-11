import { animeFallback } from "@/data/anime";
import { mangaFallback } from "@/data/manga";
import type { MediaEntry, MediaStatus } from "@/lib/types";
import { MediaEntrySchema } from "@/lib/types";
import { REVALIDATE_SECONDS } from "@/lib/site";

/* -------------------------------------------------------------------------- */
/*  AniList (primary) — public GraphQL, no API key required                    */
/* -------------------------------------------------------------------------- */

const ANILIST_ENDPOINT = "https://graphql.anilist.co";
const JIKAN_ENDPOINT = "https://api.jikan.moe/v4";
const TIMEOUT_MS = 15_000;
/** Hard cap so an enormous remote list can never bloat the static payload. */
const MAX_ENTRIES = 1_000;

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Remote API values are only semi-trusted. Rather than let one malformed URL
 * fail schema validation and discard an otherwise-good entry, normalise it to
 * `undefined` up-front so the entry still renders (just without a cover/link).
 */
function safeUrlValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return undefined;
}

/**
 * Remote entries are only semi-trusted: validate each one against the same
 * zod schema the local data uses, and drop anything malformed (a bad image
 * URL or unknown status would otherwise break rendering).
 */
function validateEntries(
  candidates: (MediaEntry | null)[],
  kind: MediaKind,
): MediaEntry[] {
  const entries: MediaEntry[] = [];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const parsed = MediaEntrySchema.safeParse(candidate);
    if (parsed.success) {
      entries.push(parsed.data);
    } else {
      console.warn(
        `[anilist] skipped invalid ${kind} entry: ${parsed.error.issues[0]?.message}`,
      );
    }
  }
  return entries.slice(0, MAX_ENTRIES);
}

type MediaKind = "anime" | "manga";

type MediaSource = "anilist" | "jikan" | "fallback";

export interface MediaListResult {
  entries: MediaEntry[];
  source: MediaSource;
}

interface AniListTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

interface AniListMedia {
  id: number;
  title?: AniListTitle | null;
  coverImage?: { large?: string | null; extraLarge?: string | null } | null;
  format?: string | null;
  seasonYear?: number | null;
  episodes?: number | null;
  chapters?: number | null;
  genres?: string[] | null;
  siteUrl?: string | null;
  isFavourite?: boolean;
}

interface AniListEntry {
  status?: string | null;
  score?: number | null;
  progress?: number | null;
  media?: AniListMedia | null;
}

interface AniListList {
  entries?: AniListEntry[] | null;
}

interface AniListResponse {
  data?: {
    MediaListCollection?: {
      lists?: AniListList[] | null;
    } | null;
  };
  errors?: { message?: string }[];
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { large extraLarge }
  format
  seasonYear
  episodes
  chapters
  genres
  siteUrl
  isFavourite
`;

function buildAniListQuery(kind: MediaKind) {
  return `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ${kind.toUpperCase()}, sort: UPDATED_TIME_DESC) {
        lists {
          entries {
            status
            score(format: POINT_100)
            progress
            media { ${MEDIA_FIELDS} }
          }
        }
      }
    }
  `;
}

const ANILIST_STATUS_MAP: Record<string, (kind: MediaKind) => MediaStatus> = {
  CURRENT: (kind) => (kind === "anime" ? "watching" : "reading"),
  REPEATING: (kind) => (kind === "anime" ? "watching" : "reading"),
  PLANNING: () => "plan",
  COMPLETED: () => "completed",
  DROPPED: () => "dropped",
  PAUSED: () => "on_hold",
};

function mapAniListEntry(
  entry: AniListEntry,
  kind: MediaKind,
): MediaEntry | null {
  const media = entry.media;
  if (!media || typeof media.id !== "number") return null;

  const mapStatus =
    ANILIST_STATUS_MAP[entry.status ?? ""] ?? (() => "plan" as MediaStatus);
  const title =
    media.title?.english ||
    media.title?.romaji ||
    media.title?.native ||
    `AniList #${media.id}`;

  const total =
    kind === "anime"
      ? (media.episodes ?? undefined)
      : (media.chapters ?? undefined);

  return {
    id: media.id,
    title,
    titleAlt: media.title?.romaji ?? undefined,
    coverImage: safeUrlValue(
      media.coverImage?.extraLarge ?? media.coverImage?.large,
    ),
    status: mapStatus(kind),
    score:
      typeof entry.score === "number" && entry.score > 0
        ? entry.score
        : undefined,
    progress: typeof entry.progress === "number" ? entry.progress : undefined,
    total: total ?? undefined,
    format: media.format ?? undefined,
    year: media.seasonYear ?? undefined,
    genres: media.genres ?? undefined,
    link: safeUrlValue(media.siteUrl),
    favourite: media.isFavourite ?? undefined,
  };
}

async function fetchFromAniList(
  userName: string,
  kind: MediaKind,
): Promise<MediaEntry[]> {
  const response = await fetch(ANILIST_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: buildAniListQuery(kind),
      variables: { userName },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`AniList responded ${response.status}`);
  }

  const json = (await response.json()) as AniListResponse;
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "AniList returned an error");
  }

  const lists = json.data?.MediaListCollection?.lists ?? [];
  const mapped: (MediaEntry | null)[] = [];
  for (const list of lists) {
    for (const entry of list.entries ?? []) {
      mapped.push(mapAniListEntry(entry, kind));
    }
  }
  return validateEntries(mapped, kind);
}

/* -------------------------------------------------------------------------- */
/*  Jikan (MyAnimeList alternative) — free, no key, strict rate limits         */
/* -------------------------------------------------------------------------- */

interface JikanListEntry {
  entry?: {
    mal_id?: number;
    title?: string | null;
    images?: {
      jpg?: { large_image_url?: string | null; image_url?: string | null };
    } | null;
    url?: string | null;
    episodes?: number | null;
    chapters?: number | null;
    genres?: { name?: string }[] | null;
    year?: number | null;
  } | null;
  score?: number | null;
  progress?: number | null;
  status?: string | null;
}

interface JikanResponse {
  data?: JikanListEntry[] | null;
}

const JIKAN_STATUS_MAP: Record<string, MediaStatus> = {
  watching: "watching",
  reading: "reading",
  completed: "completed",
  "plan to watch": "plan",
  "plan to read": "plan",
  "on-hold": "on_hold",
  dropped: "dropped",
};

function mapJikanEntry(
  entry: JikanListEntry,
  kind: MediaKind,
): MediaEntry | null {
  const media = entry.entry;
  if (!media || typeof media.mal_id !== "number") return null;

  const statusKey = (entry.status ?? "").toLowerCase();
  const status =
    JIKAN_STATUS_MAP[statusKey] ?? (kind === "anime" ? "watching" : "reading");
  const total = kind === "anime" ? media.episodes : media.chapters;

  return {
    id: `mal-${media.mal_id}`,
    title: media.title ?? `MAL #${media.mal_id}`,
    coverImage: safeUrlValue(
      media.images?.jpg?.large_image_url ?? media.images?.jpg?.image_url,
    ),
    status,
    score:
      typeof entry.score === "number" && entry.score > 0
        ? Math.round(entry.score * 10)
        : undefined,
    progress: typeof entry.progress === "number" ? entry.progress : undefined,
    total: total ?? undefined,
    year: media.year ?? undefined,
    genres: media.genres
      ?.map((g) => g.name)
      .filter((n): n is string => Boolean(n)),
    link: safeUrlValue(media.url),
  };
}

async function fetchFromJikan(
  userName: string,
  kind: MediaKind,
): Promise<MediaEntry[]> {
  const endpoint = kind === "anime" ? "animelist" : "mangalist";
  const url = `${JIKAN_ENDPOINT}/users/${encodeURIComponent(userName)}/${endpoint}?limit=300`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`Jikan responded ${response.status}`);
  }

  const json = (await response.json()) as JikanResponse;
  const mapped: (MediaEntry | null)[] = [];
  for (const item of json.data ?? []) {
    mapped.push(mapJikanEntry(item, kind));
  }
  return validateEntries(mapped, kind);
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                 */
/* -------------------------------------------------------------------------- */

async function getMediaList(kind: MediaKind): Promise<MediaListResult> {
  const anilistUser = process.env.ANILIST_USERNAME?.trim();
  const malUser = process.env.MAL_USERNAME?.trim();
  const fallback = kind === "anime" ? animeFallback : mangaFallback;

  if (anilistUser) {
    try {
      const entries = await fetchFromAniList(anilistUser, kind);
      // A successful response is authoritative — even an empty list, which
      // means the account genuinely has nothing in this category. Only a
      // *failed* request falls through to Jikan/local data.
      return { entries, source: "anilist" };
    } catch (error) {
      console.warn(
        `[anilist] ${kind} sync failed, falling back: ${describeError(error)}`,
      );
    }
  }

  if (malUser) {
    try {
      const entries = await fetchFromJikan(malUser, kind);
      return { entries, source: "jikan" };
    } catch (error) {
      console.warn(
        `[jikan] ${kind} sync failed, falling back: ${describeError(error)}`,
      );
    }
  }

  return { entries: fallback, source: "fallback" };
}

export function getAnimeList(): Promise<MediaListResult> {
  return getMediaList("anime");
}

export function getMangaList(): Promise<MediaListResult> {
  return getMediaList("manga");
}

export function isAnimeSyncConfigured(): boolean {
  return Boolean(
    process.env.ANILIST_USERNAME?.trim() || process.env.MAL_USERNAME?.trim(),
  );
}
