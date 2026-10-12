/**
 * The one track the corner player sings.
 *
 * Kept as a plain type (not a Zod schema) on purpose: this is static,
 * first-party content and `components/now-playing` is a client component, so
 * importing the validated `@/lib/types` graph here would drag Zod into the
 * browser bundle for no benefit.
 *
 * How playback works — and why it is an embed, not a file:
 *   The song is copyrighted, so we never host an audio file. Instead we drive
 *   the official YouTube upload through the IFrame Player API, which is free,
 *   needs no API key, and is the licence-clean way to play it. Swap `youtubeId`
 *   for any other video (any public track) and the card follows.
 */
export interface NowPlayingTrack {
  title: string;
  artist: string;
  album?: string;
  /** YouTube video id — the video that the corner player embeds. */
  youtubeId: string;
  /** A link out, for people who'd rather open it elsewhere. */
  href?: string;
}

export const nowPlaying: NowPlayingTrack = {
  title: "I Really Want to Stay at Your House",
  artist: "Rosa Walton & Hallie Coggins",
  album: "Cyberpunk: Edgerunners",
  youtubeId: "gzbLODUb1sA",
  href: "https://www.youtube.com/watch?v=gzbLODUb1sA",
};
