import type { MusicEntry } from "@/lib/types";
import { MusicEntrySchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// FAVOURITE MUSIC
// type: "track" | "album" | "artist"
//
// TIP: paste a real Spotify link into `link` (open the album/track/artist, then
// "Copy link"), and grab its artwork URL for `coverImage`. Both are optional —
// leave them out and the card renders a clean music-note placeholder instead of
// a broken image or a dead link.
// ---------------------------------------------------------------------------

export const music: MusicEntry[] = MusicEntrySchema.array().parse([
  {
    id: "m1",
    title: "花 (Hana)",
    artist: "Fujii Kaze",
    album: "Help Ever Hurt Never",
    type: "album",
    favourite: true,
  },
  {
    id: "m2",
    title: "Souvlaki",
    artist: "Slowdive",
    type: "album",
    favourite: true,
  },
  {
    id: "m3",
    title: "Merry Christmas Mr. Lawrence",
    artist: "Ryuichi Sakamoto",
    type: "track",
    favourite: true,
  },
  {
    id: "m4",
    title: "Kenshi Yonezu",
    artist: "Kenshi Yonezu",
    type: "artist",
  },
  {
    id: "m5",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    type: "album",
  },
  {
    id: "m6",
    title: "Nujabes",
    artist: "Nujabes",
    type: "artist",
  },
]);
