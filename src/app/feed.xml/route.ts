import { getArticles } from "@/lib/articles";
import { profile } from "@/data/profile";
import { REVALIDATE_SECONDS, siteConfig } from "@/lib/site";
import { safeHref } from "@/lib/utils";

// Must be a literal — Next route segment config is statically analysed.
export const revalidate = 21600; // 6 hours

/**
 * Escape for XML *and* drop characters that are illegal in XML 1.0 (C0 control
 * chars and the two non-characters). Feed titles/summaries come from third
 * parties and can otherwise produce a document no reader will parse.
 */
function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC-822 date, or the epoch when a feed supplied an unparseable value. */
function toRssDate(value: string | undefined): string {
  const date = value ? new Date(value) : new Date();
  return (Number.isNaN(date.getTime()) ? new Date(0) : date).toUTCString();
}

export async function GET() {
  const { articles } = await getArticles();
  const feedUrl = `${siteConfig.url}/feed.xml`;
  const updated = articles[0]?.publishedAt;

  const items = articles
    .map((article) => {
      // Strip anything that is not http(s)/site-relative, then make it
      // absolute so the feed is always self-consistent.
      const safe = safeHref(article.url);
      if (!safe) return null;
      const link = safe.startsWith("/") ? `${siteConfig.url}${safe}` : safe;
      // RSS <link> must be an absolute http(s) URL — drop mailto: and others.
      if (!/^https?:/i.test(link)) return null;
      // Manual updates can share a URL; the guid must still be unique per item.
      const guid = `${article.source}:${safe}:${article.publishedAt}:${article.title}`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(guid)}</guid>
      <pubDate>${toRssDate(article.publishedAt)}</pubDate>
      <category>${escapeXml(article.source)}</category>
${article.summary ? `      <description>${escapeXml(article.summary)}</description>\n` : ""}    </item>`;
    })
    .filter((item): item is string => item !== null)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${profile.name} — Articles & Updates`)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.shortDescription)}</description>
    <language>en</language>
    <lastBuildDate>${toRssDate(updated)}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });
}
