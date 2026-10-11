import type { MediaEntry } from "@/lib/types";
import { MediaEntrySchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// FALLBACK MANGA LIST
//
// If ANILIST_USERNAME (or MAL_USERNAME, via Jikan) is set this is ignored and
// your live list is fetched. Keep it as an offline fallback.
//
// status: "reading" | "completed" | "plan" | "on_hold" | "dropped"
// ---------------------------------------------------------------------------

export const mangaFallback: MediaEntry[] = MediaEntrySchema.array().parse([
  {
    id: 101,
    title: "Vagabond",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx656-9z7uNoAXFs3D.png",
    status: "reading",
    score: 95,
    progress: 200,
    total: 327,
    format: "MANGA",
    year: 1998,
    genres: ["Action", "Adventure", "Drama"],
    link: "https://anilist.co/manga/656",
    favourite: true,
  },
  {
    id: 102,
    title: "Berserk",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-WQlDUzXCVNkN.jpg",
    status: "reading",
    score: 98,
    progress: 150,
    total: 380,
    format: "MANGA",
    year: 1989,
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    link: "https://anilist.co/manga/30002",
    favourite: true,
  },
  {
    id: 103,
    title: "Oyasumi Punpun",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30480-vnR7PsAfC1Zq.jpg",
    status: "completed",
    score: 90,
    progress: 147,
    total: 147,
    format: "MANGA",
    year: 2007,
    genres: ["Drama", "Psychological", "Slice of Life"],
    link: "https://anilist.co/manga/30480",
  },
  {
    id: 104,
    title: "20th Century Boys",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx29974-M3dqZQF7nMxD.jpg",
    status: "plan",
    total: 249,
    format: "MANGA",
    year: 1999,
    genres: ["Mystery", "Sci-Fi", "Drama"],
    link: "https://anilist.co/manga/29974",
  },
  {
    id: 105,
    title: "Chainsaw Man",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx105778-ZlBmANmfx9cX.jpg",
    status: "plan",
    format: "MANGA",
    year: 2018,
    genres: ["Action", "Comedy", "Horror"],
    link: "https://anilist.co/manga/105778",
  },
]);
