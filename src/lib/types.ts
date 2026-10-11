import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*  Shared primitives                                                         */
/* -------------------------------------------------------------------------- */

/**
 * URLs come from three places: local data files, AniList/Jikan, and
 * arbitrary RSS/Atom feeds. Feeds are the risky one — a compromised feed
 * could emit a `javascript:` link that would become a live XSS vector when
 * rendered into an `<a href>`. Everything therefore goes through this
 * allow-list: http(s), mailto, or site-relative ("/...").
 */
const safeUrl = (label = "URL") =>
  z
    .string()
    .refine(
      (value) =>
        /^https?:\/\//i.test(value) ||
        /^mailto:/i.test(value) ||
        (value.startsWith("/") && !value.startsWith("//")),
      {
        message: `${label} must be an absolute http(s)/mailto URL or a site-relative path`,
      },
    );

const imageUrl = z
  .string()
  .refine(
    (value) =>
      /^https?:\/\//i.test(value) ||
      (value.startsWith("/") && !value.startsWith("//")),
    {
      message: "image must be an absolute http(s) URL or a site-relative path",
    },
  )
  .optional();

const linkUrl = safeUrl("link").optional();

/* -------------------------------------------------------------------------- */
/*  Anime / Manga                                                             */
/* -------------------------------------------------------------------------- */

export const mediaStatusValues = [
  "watching",
  "reading",
  "completed",
  "plan",
  "on_hold",
  "dropped",
] as const;

export const MediaStatusSchema = z.enum(mediaStatusValues);
export type MediaStatus = z.infer<typeof MediaStatusSchema>;

export const MediaEntrySchema = z.object({
  id: z.union([z.number(), z.string()]),
  title: z.string().min(1),
  /** Localised/romaji alternative title */
  titleAlt: z.string().optional(),
  coverImage: imageUrl,
  status: MediaStatusSchema,
  /** Normalised 0–100 score */
  score: z.number().min(0).max(100).optional(),
  /** Episodes/chapters consumed */
  progress: z.number().min(0).optional(),
  /** Total episodes/chapters (0 or undefined = unknown/ongoing) */
  total: z.number().min(0).optional(),
  format: z.string().optional(),
  year: z.number().int().optional(),
  genres: z.array(z.string()).optional(),
  link: linkUrl,
  favourite: z.boolean().optional(),
  notes: z.string().optional(),
});

export type MediaEntry = z.infer<typeof MediaEntrySchema>;

/* -------------------------------------------------------------------------- */
/*  Games                                                                     */
/* -------------------------------------------------------------------------- */

export const gameStatusValues = [
  "playing",
  "completed",
  "backlog",
  "on_hold",
  "dropped",
] as const;

export const GameStatusSchema = z.enum(gameStatusValues);
export type GameStatus = z.infer<typeof GameStatusSchema>;

export const GameSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  coverImage: imageUrl,
  status: GameStatusSchema,
  platform: z.string().min(1),
  hoursPlayed: z.number().min(0).optional(),
  score: z.number().min(0).max(100).optional(),
  link: linkUrl,
  favourite: z.boolean().optional(),
  notes: z.string().optional(),
});

export type Game = z.infer<typeof GameSchema>;

export const GameUIDSchema = z.object({
  game: z.string().min(1),
  uid: z.string().min(1),
  region: z.string().min(1),
  platform: z.string().min(1),
  note: z.string().optional(),
  link: linkUrl,
});

export type GameUID = z.infer<typeof GameUIDSchema>;

/* -------------------------------------------------------------------------- */
/*  Music                                                                     */
/* -------------------------------------------------------------------------- */

export const musicTypeValues = ["track", "album", "artist"] as const;
export const MusicTypeSchema = z.enum(musicTypeValues);
export type MusicType = z.infer<typeof MusicTypeSchema>;

export const MusicEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().min(1),
  album: z.string().optional(),
  coverImage: imageUrl,
  link: linkUrl,
  type: MusicTypeSchema,
  favourite: z.boolean().optional(),
});

export type MusicEntry = z.infer<typeof MusicEntrySchema>;

/* -------------------------------------------------------------------------- */
/*  Socials / Discord                                                         */
/* -------------------------------------------------------------------------- */

export const SocialLinkSchema = z.object({
  /** lucide-react icon name, resolved in `components/platform-icon` */
  platform: z.string().min(1),
  label: z.string().min(1),
  url: safeUrl("social URL"),
  handle: z.string().optional(),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

export const DiscordSchema = z.object({
  username: z.string().min(1),
  /** Numeric Discord user id — used to build the friend-request link */
  userId: z.string().optional(),
  serverName: z.string().optional(),
  /** Permanent/vanity invite. Leave empty to hide the button. */
  serverInviteUrl: z
    .string()
    .refine((value) => value === "" || /^https?:\/\//i.test(value), {
      message: "invite must be an absolute http(s) URL",
    })
    .optional(),
});

export type Discord = z.infer<typeof DiscordSchema>;

/* -------------------------------------------------------------------------- */
/*  Profile / Résumé                                                          */
/* -------------------------------------------------------------------------- */

export const ProfileSchema = z.object({
  name: z.string().min(1),
  handle: z.string().min(1),
  pronouns: z.string().optional(),
  tagline: z.string().min(1),
  location: z.string().optional(),
  avatar: imageUrl,
  email: z.string().optional(),
  bio: z.array(z.string()).min(1),
  now: z.object({
    updated: z.string(),
    focus: z.array(z.string()).default([]),
    learning: z.array(z.string()).default([]),
  }),
});

export type Profile = z.infer<typeof ProfileSchema>;

export const ResumeSchema = z.object({
  summary: z.string(),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      location: z.string().optional(),
      start: z.string(),
      end: z.string(),
      highlights: z.array(z.string()).default([]),
      tech: z.array(z.string()).default([]),
    }),
  ),
  education: z.array(
    z.object({
      degree: z.string(),
      school: z.string(),
      location: z.string().optional(),
      start: z.string(),
      end: z.string(),
      highlights: z.array(z.string()).default([]),
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      link: linkUrl,
      tech: z.array(z.string()).default([]),
    }),
  ),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string(),
        year: z.string().optional(),
        link: linkUrl,
      }),
    )
    .default([]),
});

export type Resume = z.infer<typeof ResumeSchema>;

/* -------------------------------------------------------------------------- */
/*  Articles / Updates (RSS aggregation)                                      */
/* -------------------------------------------------------------------------- */

export const FeedSourceSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  /** Optional platform hint used for the source badge */
  platform: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type FeedSource = z.infer<typeof FeedSourceSchema>;

export const ArticleSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  source: z.string().min(1),
  platform: z.string().optional(),
  publishedAt: z.string(),
  summary: z.string().optional(),
  tags: z.array(z.string()).optional(),
  /** true when the item came from the local fallback data (offline build) */
  fallback: z.boolean().optional(),
});

export type Article = z.infer<typeof ArticleSchema>;

export const UpdateEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  date: z.string(),
  kind: z.enum(["blog", "video", "post", "release", "note", "stream"]),
  summary: z.string().optional(),
  url: linkUrl,
  pinned: z.boolean().optional(),
});

export type UpdateEntry = z.infer<typeof UpdateEntrySchema>;
