# Portfolio

A data-driven personal portfolio built with Next.js. Everything on the site — your bio,
social links, the anime and manga you're watching, the games you play, your favourite
music, your résumé and the posts you publish — lives in plain, typed files under
`src/data/`. Edit one file and the site updates; you never have to touch the layout.

Anime and manga can auto-sync straight from [AniList](https://anilist.co) (or MyAnimeList,
via Jikan), and the Articles page aggregates your RSS/Atom feeds into a single feed that
the site also republishes as `/feed.xml`.

## What's inside

- **Next.js 16 App Router** with **React 19**, **TypeScript** (strict) and **Tailwind CSS v4**.
- **Typed, validated content** — every data file is parsed with [zod](https://zod.dev), so a
  typo fails the build instead of silently shipping.
- **Pages:** Home (About + Now), Anime, Manga, Games (with game UIDs), Music, Articles,
  Résumé, Connect (socials + Discord).
- **AniList / MyAnimeList auto-sync** with local fallback files that always render.
- **Article aggregation** from any RSS/Atom feed, plus manual updates, exposed as `/feed.xml`.
- **Discord** friend-request link and a server invite button.
- **Résumé** as a web page with an optional downloadable PDF.
- **Zero cost:** free hosting on Vercel, and every external service used is free and
  needs no API key.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Create your local environment file
cp .env.example .env.local
#    Then open .env.local and fill in your values (see the table below).

# 3. Start the dev server
npm run dev
#    → http://localhost:3000
```

Then open the files under `src/data/` and replace the placeholder values with your own.

### Commands

| Command             | What it does                                 |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the development server with hot reload |
| `npm run build`     | Produce a production build                   |
| `npm run start`     | Serve the production build locally           |
| `npm run lint`      | Lint with ESLint                             |
| `npm run typecheck` | Type-check with `tsc --noEmit`               |
| `npm run format`    | Format everything with Prettier              |

## How to update your content

This is the important bit. Find what you want to change in the left column, edit the file
in the right column, and save. No other file needs to be touched.

| I want to change…                                                   | Edit this file                                  |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| My name, handle, pronouns, tagline, location, avatar, email and bio | `src/data/profile.ts`                           |
| The "Now" panel (focus, learning, playing, watching, reading)       | `src/data/profile.ts` (the `now` block)         |
| My social links (GitHub, X, YouTube, Spotify, LinkedIn, email, …)   | `src/data/socials.ts` (the `socials` array)     |
| Discord username, friend-request ID, server name and invite         | `src/data/socials.ts` (the `rawDiscord` object) |
| My anime list (offline fallback)                                    | `src/data/anime.ts`                             |
| My manga list (offline fallback)                                    | `src/data/manga.ts`                             |
| My games                                                            | `src/data/games.ts` (the `games` array)         |
| My in-game UIDs / player IDs                                        | `src/data/games.ts` (the `gameUIDs` array)      |
| My favourite music                                                  | `src/data/music.ts`                             |
| My résumé (experience, education, skills, projects, certifications) | `src/data/resume.ts`                            |
| My downloadable résumé PDF                                          | `public/resume.pdf` (see the résumé note below) |
| The RSS/Atom feeds shown on the Articles page                       | `src/data/feeds.ts`                             |
| Manual announcements / updates                                      | `src/data/updates.ts`                           |
| Site title, description and navigation menu                         | `src/lib/site.ts`                               |
| The content model (what fields each entry accepts)                  | `src/lib/types.ts`                              |

### Notes per section

- **Profile** — this drives the Home page (hero, "About" and "Now") and the site metadata.
- **Socials** — `platform` maps to an icon in `src/components/platform-icon.tsx`. Supported
  values include `github`, `x`, `twitter`, `linkedin`, `youtube`, `instagram`, `twitch`,
  `tiktok`, `reddit`, `bluesky`, `mastodon`, `discord`, `steam`, `spotify`, `anilist`,
  `myanimelist`, `letterboxd`, `website` and `email`.
- **Discord** — set `userId` to your **numeric** Discord user ID to enable the
  "Send friend request" button (it links to `https://discord.com/users/<userId>`). Set
  `serverInviteUrl` to show a "Join my server" button. Leave either blank to hide it.
- **Anime / manga** — these files are only the **fallback**. If you set an AniList or
  MyAnimeList username (see below), your live list replaces them. Keep them populated so
  the site still renders if the network is unavailable at build time.
- **Games & UIDs** — the Games page groups entries by `status` (`playing`, `completed`,
  `backlog`, `on_hold`, `dropped`) and renders the `gameUIDs` list further down the same
  page under `#uids`.
- **Résumé** — the web page is generated from `src/data/resume.ts`. To enable the
  "Download PDF" button, drop a PDF at `public/resume.pdf`. (If the `public/` folder
  doesn't exist yet, create it.) The button only appears when that file is present; the
  page falls back to a "Print" button otherwise.

## Environment variables

Copy `.env.example` to `.env.local` for local development. On Vercel, add the same keys
under **Project → Settings → Environment Variables**.

| Variable                     | Required               | Purpose                                                                                                                                                |
| ---------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`       | **Yes for production** | The public production URL. Used for metadata, the sitemap, the RSS feed and Open Graph tags. Defaults to `https://your-portfolio.vercel.app` if unset. |
| `NEXT_PUBLIC_TWITTER_HANDLE` | No                     | Your X/Twitter handle (including the `@`) for social card metadata.                                                                                    |
| `ANILIST_USERNAME`           | No                     | Your AniList username. Auto-syncs **both** your anime and manga lists. Free public API — no key required.                                              |
| `MAL_USERNAME`               | No                     | Your MyAnimeList username, synced via the free Jikan API. Used only when `ANILIST_USERNAME` is unset or its sync fails.                                |

> `NEXT_PUBLIC_*` variables are exposed to the browser; the others are only read on the
> server at build/revalidate time.

## Auto-sync (Anime & Manga)

The anime and manga pages resolve their data in this order:

1. **AniList** (primary) — if `ANILIST_USERNAME` is set, the site queries AniList's public
   GraphQL API (`https://graphql.anilist.co`). No API key is needed. This fetches both your
   anime and manga lists.
2. **Jikan / MyAnimeList** (fallback) — if AniList isn't configured or its request _fails_, and
   `MAL_USERNAME` is set, the site queries the free Jikan API (`https://api.jikan.moe/v4`). A
   successful-but-empty AniList response is treated as authoritative and is **not** replaced.
3. **Local files** (final fallback) — if neither source is available or both fail, the site
   renders `src/data/anime.ts` and `src/data/manga.ts`. The build never fails because of a
   network problem; it degrades gracefully.

The source actually in use is shown as a badge on the Anime and Manga pages
("Synced from AniList", "Synced from MyAnimeList" or "Local data"). Synced data is cached
and revalidated every 6 hours. The interval lives in `REVALIDATE_SECONDS` in `src/lib/site.ts`
(used for `fetch` caching); note that each route's `revalidate` export must be a **literal**
number — Next.js statically analyses route segment config, so it can't import that constant.

## Articles & RSS

The Articles page merges two sources into one reverse-chronological list:

1. **External feeds** configured in `src/data/feeds.ts`.
2. **Manual updates** from `src/data/updates.ts` (anything that isn't in a feed — a launch,
   a milestone, a note).

Both appear on the page and in the site's own RSS output at **`/feed.xml`**.

### Adding a feed

Open `src/data/feeds.ts`, replace the placeholder URL, and set `enabled: true`:

```ts
export const feedSources: FeedSource[] = FeedSourceSchema.array().parse([
  {
    name: "dev.to",
    url: "https://dev.to/feed/yourhandle",
    platform: "devto",
    enabled: true, // ← flip this once the URL is real
  },
]);
```

A feed with `enabled: false` is skipped entirely. If an enabled feed fails to load, the
page keeps rendering and shows a small non-fatal notice listing which feed failed.

### Where to find your feed URL

| Platform          | Feed URL pattern                                                   |
| ----------------- | ------------------------------------------------------------------ |
| dev.to            | `https://dev.to/feed/<username>`                                   |
| Medium            | `https://medium.com/feed/@<username>`                              |
| Substack          | `https://<name>.substack.com/feed`                                 |
| Hashnode          | `https://<name>.hashnode.dev/rss.xml`                              |
| YouTube (channel) | `https://www.youtube.com/feeds/videos.xml?channel_id=<channel_id>` |
| GitHub (activity) | `https://github.com/<user>.atom`                                   |
| Reddit (user)     | `https://www.reddit.com/user/<user>/.rss`                          |
| Bluesky           | `https://bsky.app/profile/<handle>.rss`                            |
| Personal blog     | `https://example.com/feed.xml`                                     |

### The `/feed.xml` output

The site publishes its own RSS 2.0 feed at `/feed.xml` (see
`src/app/feed.xml/route.ts`), built from the same aggregated list. Visitors can subscribe
to one URL to follow everything. On the Articles page the feed is advertised in the page
metadata and via a "Copy feed URL" button.

## Deployment to Vercel

The project is designed to run on Vercel's free tier at zero cost.

1. Push the repository to GitHub.
2. In Vercel, choose **New Project** and import the repository.
3. Add your environment variables under **Project → Settings → Environment Variables**
   (`NEXT_PUBLIC_SITE_URL`, and optionally `NEXT_PUBLIC_TWITTER_HANDLE`, `ANILIST_USERNAME`
   and `MAL_USERNAME`).
4. Deploy. Vercel detects Next.js automatically — no build configuration needed.
5. Optionally add a custom domain under **Settings → Domains**.

> **Set `NEXT_PUBLIC_SITE_URL` to your production URL** (for example
> `https://your-portfolio.vercel.app` or your custom domain). It's used for canonical URLs,
> the sitemap, Open Graph tags and the RSS feed, so leaving it as the placeholder will
> produce incorrect links.

## Project structure

```
portfolio/
├─ public/                     # static assets (create if missing)
│  └─ resume.pdf               # optional — enables the "Download PDF" button
├─ src/
│  ├─ app/                     # Next.js App Router
│  │  ├─ layout.tsx            # root layout: metadata, theme, nav, footer
│  │  ├─ page.tsx              # Home — hero, About, Now, browse, latest updates
│  │  ├─ anime/page.tsx        # Anime list (auto-synced or local fallback)
│  │  ├─ manga/page.tsx        # Manga list
│  │  ├─ games/page.tsx        # Games grouped by status + Game UIDs (#uids)
│  │  ├─ music/page.tsx        # Favourite music
│  │  ├─ articles/page.tsx     # Aggregated articles + manual updates
│  │  ├─ resume/page.tsx       # Web résumé + optional PDF download
│  │  ├─ connect/page.tsx      # Socials + Discord
│  │  ├─ feed.xml/route.ts     # RSS 2.0 output of the articles feed
│  │  ├─ sitemap.ts            # generated sitemap
│  │  ├─ robots.ts             # generated robots.txt
│  │  ├─ not-found.tsx         # 404 page
│  │  ├─ globals.css           # Tailwind v4 entry + theme tokens
│  │  └─ icon.svg              # favicon
│  ├─ components/              # reusable UI (cards, nav, media grid, buttons, …)
│  ├─ data/                    # ← your content lives here (typed + validated)
│  │  ├─ profile.ts            # name, bio, Now panel
│  │  ├─ socials.ts            # social links + Discord
│  │  ├─ anime.ts              # anime fallback
│  │  ├─ manga.ts              # manga fallback
│  │  ├─ games.ts              # games + game UIDs
│  │  ├─ music.ts              # favourite music
│  │  ├─ resume.ts             # résumé content
│  │  ├─ feeds.ts              # RSS/Atom feed sources
│  │  └─ updates.ts            # manual updates
│  └─ lib/                     # logic and helpers
│     ├─ types.ts              # zod schemas + TypeScript types
│     ├─ site.ts               # site config, navigation, revalidate window
│     ├─ anilist.ts            # AniList + Jikan sync with local fallback
│     ├─ feeds.ts              # RSS/Atom fetching + parsing
│     ├─ articles.ts           # merges feeds + manual updates
│     └─ utils.ts              # formatting helpers
├─ .env.example                # environment variable template
├─ next.config.ts              # remote image domains
├─ tsconfig.json               # TypeScript config (strict, `@/*` → `src/*`)
├─ package.json
└─ README.md
```

## Troubleshooting

**The site shows my local data instead of my synced lists.**
The sync runs only when `ANILIST_USERNAME` (or `MAL_USERNAME`) is set in the environment,
and it fetches at build time. Check that the variable is present in `.env.local` locally and
in Vercel's environment variables for production, then redeploy — Vercel needs a new build
to pick up env changes. If the username is set but the upstream fetch fails (or returns an
empty list), the site deliberately falls back to `src/data/anime.ts` / `src/data/manga.ts`;
look for a `[anilist]` or `[jikan]` warning in the build logs.

**My articles aren't appearing.**
Open `src/data/feeds.ts` and confirm the feed has `enabled: true` and a correct `url`. A
feed left at `enabled: false` is skipped entirely, and a wrong URL will show up in the
"Some feeds couldn't be loaded" notice on the Articles page. YouTube feeds need the
`channel_id` (not the handle), and the URL must return XML — open it in a browser to check.

**The résumé download button is missing.**
The button only renders when `public/resume.pdf` actually exists (the page checks for the
file at build time). Add the PDF — creating the `public/` folder if it isn't there yet —
and rebuild. Until then the page shows a "Print" button instead.

**My Discord invite stopped working.**
Discord invites expire unless you configure them not to. When creating the invite in
Discord, set **Expire After → Never**, or use a vanity URL. Then paste it into
`serverInviteUrl` in `src/data/socials.ts`. A temporary invite will work at first and then
break later, which is exactly what this setting avoids.

---

Built with Next.js, React, TypeScript, Tailwind CSS and zod. Hosted free on Vercel.
