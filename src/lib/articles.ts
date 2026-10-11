import { feedSources, MAX_ARTICLES } from "@/data/feeds";
import { updates } from "@/data/updates";
import { fetchFeed } from "@/lib/feeds";
import type { Article, UpdateEntry } from "@/lib/types";

export interface ArticlesResult {
  articles: Article[];
  /** Feeds that failed to load (surfaced in the UI as a non-fatal notice). */
  errors: string[];
  /** True when at least one external feed is configured and enabled. */
  hasFeeds: boolean;
}

/** Manual updates converted into the same shape as aggregated articles. */
function manualArticles(): Article[] {
  return updates.map((update) => ({
    title: update.title,
    url: update.url ?? "/articles",
    source: "Update",
    platform: update.kind,
    publishedAt: update.date,
    summary: update.summary,
  }));
}

/**
 * Merge every enabled RSS/Atom feed with the manual updates list, newest
 * first. Network/parse failures never throw — they degrade gracefully to
 * whatever else is available so the site always renders.
 */
export async function getArticles(): Promise<ArticlesResult> {
  const enabled = feedSources.filter((source) => source.enabled);
  const errors: string[] = [];
  const fetched: Article[] = [];

  const results = await Promise.allSettled(
    enabled.map((source) => fetchFeed(source)),
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      fetched.push(...result.value);
    } else {
      const reason =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      console.warn(`[articles] "${enabled[index]?.name}" failed: ${reason}`);
      errors.push(`${enabled[index]?.name}: ${reason}`);
    }
  });

  const merged = [...fetched, ...manualArticles()].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return {
    articles: merged.slice(0, MAX_ARTICLES),
    errors,
    hasFeeds: enabled.length > 0,
  };
}

/** Sorted manual updates (pinned first), used on the home page. */
export function getUpdates(): UpdateEntry[] {
  return [...updates].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (b.pinned && !a.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}
