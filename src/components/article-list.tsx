import { ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";
import { Badge, type BadgeVariant } from "@/components/badge";
import { formatDate, relativeTime, safeHref } from "@/lib/utils";

/**
 * Badge colour per platform hint or "kind" (for manual updates). Feed sources
 * without a platform hint fall back to neutral, which is the correct default
 * for arbitrary blogs.
 */
const BADGE_VARIANT: Record<string, BadgeVariant> = {
  // Manual update kinds
  blog: "info",
  video: "danger",
  post: "primary",
  release: "success",
  note: "warning",
  stream: "purple",
  update: "primary",
  // Common platforms
  devto: "info",
  "dev.to": "info",
  medium: "neutral",
  substack: "warning",
  hashnode: "info",
  youtube: "danger",
  github: "purple",
  reddit: "warning",
  bluesky: "info",
};

function variantFor(article: Article): BadgeVariant {
  const keys = [article.platform, article.source]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
  for (const key of keys) {
    const variant = BADGE_VARIANT[key];
    if (variant) return variant;
  }
  return "neutral";
}

export function ArticleList({ articles }: { articles: Article[] }) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {articles.map((article, index) => {
        // Never trust a feed URL — only http(s) or site-relative survive.
        const href = safeHref(article.url);
        const external = href?.startsWith("http") ?? false;

        return (
          <li
            key={`${article.url}-${article.publishedAt}-${index}`}
            className="group py-5 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              <Badge variant={variantFor(article)}>{article.source}</Badge>
              <time dateTime={article.publishedAt}>
                {formatDate(article.publishedAt)}
              </time>
              <span>{relativeTime(article.publishedAt)}</span>
            </div>

            <h2 className="mt-2 font-display text-xl font-semibold leading-snug">
              {href ? (
                <a
                  href={href}
                  {...(external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-start gap-1.5 hover:text-primary"
                >
                  <span>{article.title}</span>
                  {external ? (
                    <ExternalLink
                      className="mt-1.5 h-3.5 w-3.5 shrink-0 opacity-40"
                      aria-hidden="true"
                    />
                  ) : null}
                  {external ? (
                    <span className="sr-only">(opens in a new tab)</span>
                  ) : null}
                </a>
              ) : (
                article.title
              )}
            </h2>

            {article.summary ? (
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {article.summary}
              </p>
            ) : null}

            {article.tags && article.tags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-sm border border-border bg-surface px-2 py-0.5 text-[0.7rem] text-muted"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
