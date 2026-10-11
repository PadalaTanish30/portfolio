/**
 * Central site configuration.
 *
 * Everything that needs a URL or brand-level value lives here so metadata,
 * the sitemap, RSS feed and Open Graph tags stay in sync.
 */

export const siteConfig = {
  /** Public production URL — set NEXT_PUBLIC_SITE_URL on Vercel. */
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-portfolio.vercel.app"
  ).replace(/\/$/, ""),
  title: "Portfolio",
  shortDescription:
    "Anime, manga, games, music and everything I'm up to — in one place.",
  locale: "en_GB",
  twitterHandle: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "",
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/anime", label: "Anime" },
  { href: "/manga", label: "Manga" },
  { href: "/games", label: "Games" },
  { href: "/music", label: "Music" },
  { href: "/articles", label: "Articles" },
  { href: "/resume", label: "Résumé" },
  { href: "/connect", label: "Connect" },
] as const;

export type NavItem = (typeof navigation)[number];

/** Revalidation window (seconds) for API/RSS-backed content. 6 hours. */
export const REVALIDATE_SECONDS = 60 * 60 * 6;
