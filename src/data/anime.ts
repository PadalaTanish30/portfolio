import type { MediaEntry } from "@/lib/types";
import { MediaEntrySchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// FALLBACK ANIME LIST
//
// If ANILIST_USERNAME is set (see .env.example) this file is ignored and your
// live AniList list is fetched at build/revalidate time. Keep this file as a
// sensible offline fallback so the site always renders.
//
// status: "watching" | "completed" | "plan" | "on_hold" | "dropped"
// score:  0–100 (displayed as /10)
// ---------------------------------------------------------------------------

export const animeFallback: MediaEntry[] = MediaEntrySchema.array().parse([
  {
    id: 1,
    title: "Frieren: Beyond Journey's End",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-gHSraOSa0n2H.jpg",
    status: "watching",
    score: 92,
    progress: 20,
    total: 28,
    format: "TV",
    year: 2023,
    genres: ["Adventure", "Drama", "Fantasy"],
    link: "https://anilist.co/anime/154587",
    favourite: true,
  },
  {
    id: 2,
    title: "Fullmetal Alchemist: Brotherhood",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-6TBuSaXAeiq7.png",
    status: "completed",
    score: 100,
    progress: 64,
    total: 64,
    format: "TV",
    year: 2009,
    genres: ["Action", "Adventure", "Drama"],
    link: "https://anilist.co/anime/5114",
    favourite: true,
  },
  {
    id: 3,
    title: "Bocchi the Rock!",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx130003-8jBOJmZ27C1Z.jpg",
    status: "completed",
    score: 88,
    progress: 12,
    total: 12,
    format: "TV",
    year: 2022,
    genres: ["Comedy", "Music", "Slice of Life"],
    link: "https://anilist.co/anime/130003",
  },
  {
    id: 4,
    title: "Vinland Saga Season 2",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx136430-gXM9dOZQ1zSF.jpg",
    status: "plan",
    total: 24,
    format: "TV",
    year: 2023,
    genres: ["Action", "Adventure", "Drama"],
    link: "https://anilist.co/anime/136430",
  },
  {
    id: 5,
    title: "Cyberpunk: Edgerunners",
    coverImage:
      "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx120377-jzCXh9bXp1pD.jpg",
    status: "plan",
    total: 10,
    format: "TV",
    year: 2022,
    genres: ["Action", "Sci-Fi", "Drama"],
    link: "https://anilist.co/anime/120377",
  },
]);
