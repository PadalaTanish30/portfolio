import type { MusicEntry } from "@/lib/types";
import { MusicEntrySchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// FAVOURITE MUSIC
// type: "track" | "album" | "artist"
// ---------------------------------------------------------------------------

export const music: MusicEntry[] = MusicEntrySchema.array().parse([
  {
    id: "m1",
    title: "花 (Hana)",
    artist: "Fujii Kaze",
    album: "Help Ever Hurt Never",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273e0db2e2d6d6b0c6bb4b9b0a6",
    link: "https://open.spotify.com/album/1IQaHDDvQZNBTadWJPPbGn",
    type: "album",
    favourite: true,
  },
  {
    id: "m2",
    title: "Souvlaki",
    artist: "Slowdive",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b2734d3c4b0ebbb1a0a0e5a3f0f1",
    link: "https://open.spotify.com/album/1qmdj2z5gbSRmGmXcQaBqk",
    type: "album",
    favourite: true,
  },
  {
    id: "m3",
    title: "Merry Christmas Mr. Lawrence",
    artist: "Ryuichi Sakamoto",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273a3f0c1b2c3d4e5f60718293a",
    link: "https://open.spotify.com/track/2m0tDOJZ4l6UEB6dpOZQvX",
    type: "track",
    favourite: true,
  },
  {
    id: "m4",
    title: "Kenshi Yonezu",
    artist: "Kenshi Yonezu",
    coverImage:
      "https://i.scdn.co/image/ab6761610000e5ebd3b0d0c9f0b7e0c0c8a8d0c0",
    link: "https://open.spotify.com/artist/1snhtMLeb2DYoMOcVbb8iB",
    type: "artist",
  },
  {
    id: "m5",
    title: "To Pimp a Butterfly",
    artist: "Kendrick Lamar",
    coverImage:
      "https://i.scdn.co/image/ab67616d0000b273b8f9e5c0b0d1c2e3f4a5b6c7",
    link: "https://open.spotify.com/album/7yk3BpXovqEOMLFyxlJaJP",
    type: "album",
  },
  {
    id: "m6",
    title: "Nujabes",
    artist: "Nujabes",
    coverImage:
      "https://i.scdn.co/image/ab6761610000e5eb1a2b3c4d5e6f708192a3b4c5",
    link: "https://open.spotify.com/artist/3Rq3YOF9YPqvq980P6Cu7C",
    type: "artist",
  },
]);
