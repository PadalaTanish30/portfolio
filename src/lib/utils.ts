import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic, de-duplicating conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normalise any score to a 0–10 display string. */
export function formatScore(score?: number, digits = 1): string | null {
  if (score === undefined || score === null || Number.isNaN(score)) return null;
  return (score / 10).toFixed(digits);
}

/** Human-readable date, e.g. "12 Mar 2026". */
export function formatDate(
  input: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

/** Relative time such as "3 days ago", with a graceful fallback. */
export function relativeTime(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["week", 1000 * 60 * 60 * 24 * 7],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "minute") {
      return rtf.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

/** Format a progress value like "12 / 24" or "12 eps". */
export function formatProgress(
  progress?: number,
  total?: number,
): string | null {
  if (progress === undefined && total === undefined) return null;
  const p = progress ?? 0;
  if (total && total > 0) return `${p} / ${total}`;
  return `${p}`;
}

export function percent(progress?: number, total?: number): number {
  if (!total || total <= 0 || progress === undefined) return 0;
  return Math.min(100, Math.max(0, Math.round((progress / total) * 100)));
}

/**
 * Single source of truth for the URL allow-list. Feed, API and local data are
 * only semi-trusted, so anything that isn't http(s), an allowed `mailto:`, or
 * site-relative is rejected outright (no `javascript:`, `data:`, or
 * protocol-relative URLs).
 *
 * `allowMailto` exists because the call sites legitimately differ: navigation
 * links accept `mailto:`, whereas image sources and the AniList/Jikan
 * normaliser must not.
 */
export function isAllowedUrl(
  value: string,
  { allowMailto = true }: { allowMailto?: boolean } = {},
): boolean {
  if (/^https?:\/\//i.test(value)) return true;
  if (allowMailto && /^mailto:/i.test(value)) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  return false;
}

/**
 * Allow-list a URL before it reaches an `href`. Feed and API data is only
 * semi-trusted, so anything that isn't http(s), mailto, or site-relative is
 * rejected outright (no `javascript:`, `data:`, or protocol-relative URLs).
 * Trims surrounding whitespace and returns the trimmed value, or `undefined`.
 */
export function safeHref(url?: string): string | undefined {
  if (!url) return undefined;
  const value = url.trim();
  if (!value) return undefined;
  return isAllowedUrl(value) ? value : undefined;
}

/** Truncate plain text, stripping HTML tags first. */
export function truncate(input: string, max = 180): string {
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
