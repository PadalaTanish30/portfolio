import type { Metadata } from "next";
import { AlertTriangle, Info, Rss } from "lucide-react";
import { getArticles } from "@/lib/articles";
import { siteConfig } from "@/lib/site";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/card";
import { ButtonLink } from "@/components/button-link";
import { ArticleList } from "@/components/article-list";
import { EmptyState } from "@/components/empty-state";
import { CopyButton } from "@/components/copy-button";

// Must be a literal — Next route segment config is statically analysed.
export const revalidate = 21600; // 6 hours

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Everything I publish — blog posts, videos and updates, all in one feed.",
};

export default async function ArticlesPage() {
  const { articles, errors, hasFeeds } = await getArticles();
  const feedUrl = `${siteConfig.url}/feed.xml`;

  return (
    <Container size="narrow">
      <PageHeader
        eyebrow="Articles & Updates"
        title="Everything I post"
        description="New and recent things I've published or shared, newest first. Subscribe once via RSS and you'll never miss a post."
        actions={
          <>
            <ButtonLink href="/feed.xml" variant="secondary" size="sm" external>
              <Rss className="h-4 w-4" aria-hidden="true" />
              RSS feed
            </ButtonLink>
            <CopyButton value={feedUrl} label="Copy feed URL" size="md" />
          </>
        }
      />

      {errors.length > 0 ? (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Some feeds couldn&apos;t be loaded
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {!hasFeeds ? (
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <p className="flex items-center gap-2 text-sm font-medium text-primary">
            <Info className="h-4 w-4" aria-hidden="true" />
            No external feeds configured yet
          </p>
          <p className="mt-2 text-sm text-muted">
            Add your blog, dev.to, Medium, YouTube or GitHub feed URLs in{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
              src/data/feeds.ts
            </code>{" "}
            and set{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
              enabled: true
            </code>
            . New posts then appear here (and in your RSS feed) automatically.
            Manual entries live in{" "}
            <code className="rounded bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
              src/data/updates.ts
            </code>
            .
          </p>
        </Card>
      ) : null}

      {articles.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Once you add a feed or a manual update, entries show up here automatically."
        />
      ) : (
        <ArticleList articles={articles} />
      )}
    </Container>
  );
}
