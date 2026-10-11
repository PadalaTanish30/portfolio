/**
 * Central site configuration.
 *
 * Everything that needs a URL or brand-level value lives here so metadata,
 * the sitemap, RSS feed and Open Graph tags stay in sync.
 */

const PLACEHOLDER_URL = "https://your-portfolio.vercel.app";

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

/**
 * Resolve the canonical site URL.
 *
 * `NEXT_PUBLIC_SITE_URL` always wins — set it explicitly once you attach a
 * custom domain. Otherwise fall back to the host Vercel injects at build time
 * (`VERCEL_PROJECT_PRODUCTION_URL`, or `VERCEL_URL` on previews), so a fresh
 * deploy produces correct canonical/sitemap/RSS links with no configuration.
 * Local builds with no environment at all keep the placeholder.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "";

  // Vercel injects a bare host, but tolerate a pasted full URL too.
  const host = vercelHost.replace(/^https?:\/\//i, "");

  return host ? `https://${stripTrailingSlash(host)}` : PLACEHOLDER_URL;
}

export const siteConfig = {
  /** Canonical URL, resolved from the environment (see `resolveSiteUrl`). */
  url: resolveSiteUrl(),
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
