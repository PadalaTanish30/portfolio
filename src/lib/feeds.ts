import { XMLParser } from "fast-xml-parser";
import type { Article, FeedSource } from "@/lib/types";
import { REVALIDATE_SECONDS } from "@/lib/site";
import { truncate } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Feed parsing helpers                                                      */
/* -------------------------------------------------------------------------- */

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function asText(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  const record = asRecord(value);
  if (record) {
    const text = record["#text"];
    if (typeof text === "string") return text.trim() || undefined;
  }
  return undefined;
}

function firstText(
  record: Record<string, unknown>,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = asText(record[key]);
    if (value) return value;
  }
  return undefined;
}

/** Atom `<link>` may be a string, an object, or a list of objects. */
function extractLink(value: unknown): string | undefined {
  let fallback: string | undefined;
  for (const candidate of asArray(value)) {
    const record = asRecord(candidate);
    if (!record) {
      const text = asText(candidate);
      if (text) fallback ??= text;
      continue;
    }
    const href =
      typeof record["@_href"] === "string" ? record["@_href"] : undefined;
    const rel =
      typeof record["@_rel"] === "string" ? record["@_rel"] : undefined;
    if (href && (!rel || rel === "alternate")) return href;
    if (href) fallback ??= href;
  }
  return fallback;
}

function normaliseDate(value: string | undefined): string {
  // Feeds sometimes omit or garble dates. Previously we fabricated "now",
  // which made builds non-deterministic and pushed undated items to the top.
  // Falling back to the epoch instead keeps ordering stable and honest.
  if (!value) return EPOCH;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? EPOCH : date.toISOString();
}

const EPOCH = new Date(0).toISOString();
/** Far beyond any legitimate feed, but bounds a hostile/huge response. */
const MAX_FEED_BYTES = 2_000_000;
const MAX_ITEMS_PER_FEED = 200;
const MAX_TITLE_LENGTH = 200;

function buildArticle(
  source: FeedSource,
  fields: {
    title?: string;
    link?: string;
    date?: string;
    summary?: string;
    tags?: string[];
  },
): Article | null {
  if (!fields.title || !fields.link) return null;
  // Feed content is untrusted. Resolve relative Atom links against the feed
  // URL, then allow only absolute http(s) — this blocks `javascript:`,
  // `data:` and any other dangerous scheme.
  let link: string | undefined;
  try {
    link = new URL(fields.link, source.url).toString();
  } catch {
    link = undefined;
  }
  if (!link || !/^https?:\/\//i.test(link)) return null;
  return {
    title: truncate(fields.title, MAX_TITLE_LENGTH),
    url: link,
    source: source.name,
    platform: source.platform,
    publishedAt: normaliseDate(fields.date),
    summary: fields.summary ? truncate(fields.summary, 220) : undefined,
    tags: fields.tags?.slice(0, 4),
  };
}

function parseRssItem(item: unknown, source: FeedSource): Article | null {
  const record = asRecord(item);
  if (!record) return null;
  const tags = asArray(record.category)
    .map((c) => asText(c))
    .filter((t): t is string => Boolean(t));
  return buildArticle(source, {
    title: firstText(record, ["title"]),
    link: firstText(record, ["link", "guid", "id"]),
    date: firstText(record, ["pubDate", "published", "updated", "dc:date"]),
    summary: firstText(record, [
      "description",
      "content:encoded",
      "summary",
      "content",
    ]),
    tags,
  });
}

function parseAtomEntry(entry: unknown, source: FeedSource): Article | null {
  const record = asRecord(entry);
  if (!record) return null;
  const tags = asArray(record.category)
    .map((c) => {
      const rec = asRecord(c);
      return rec ? asText(rec["@_term"]) : asText(c);
    })
    .filter((t): t is string => Boolean(t));
  return buildArticle(source, {
    title: firstText(record, ["title"]),
    link: extractLink(record.link),
    date: firstText(record, ["published", "updated"]),
    summary: firstText(record, ["summary", "content"]),
    tags,
  });
}

export function parseFeed(xml: string, source: FeedSource): Article[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    trimValues: true,
    textNodeName: "#text",
  });

  const doc = asRecord(parser.parse(xml));
  if (!doc) return [];

  const articles: Article[] = [];

  // RSS 2.0 — <rss><channel><item>
  const rssChannel = asRecord(asRecord(doc.rss)?.channel);
  if (rssChannel) {
    for (const item of asArray(rssChannel.item)) {
      const article = parseRssItem(item, source);
      if (article) articles.push(article);
    }
  }

  // Atom — <feed><entry>
  const atomFeed = asRecord(doc.feed);
  if (atomFeed) {
    for (const entry of asArray(atomFeed.entry)) {
      const article = parseAtomEntry(entry, source);
      if (article) articles.push(article);
    }
  }

  // RSS 1.0 / RDF — <rdf:RDF><item>
  const rdf = asRecord(doc["rdf:RDF"]);
  if (rdf) {
    for (const item of asArray(rdf.item)) {
      const article = parseRssItem(item, source);
      if (article) articles.push(article);
    }
  }

  return articles;
}

export async function fetchFeed(source: FeedSource): Promise<Article[]> {
  // Defence in depth: zod already rejects non-URL strings, but never trust a
  // configured URL to be http(s) before handing it to fetch().
  if (!/^https?:\/\//i.test(source.url)) {
    throw new Error("feed URL must be http(s)");
  }

  const response = await fetch(source.url, {
    headers: {
      Accept:
        "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      "User-Agent": "portfolio-articles-aggregator/1.0",
    },
    signal: AbortSignal.timeout(15_000),
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const declaredSize = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredSize) && declaredSize > MAX_FEED_BYTES) {
    throw new Error(`feed too large (${declaredSize} bytes)`);
  }

  const xml = await response.text();
  if (Buffer.byteLength(xml, "utf8") > MAX_FEED_BYTES) {
    throw new Error("feed too large");
  }

  return parseFeed(xml, source).slice(0, MAX_ITEMS_PER_FEED);
}
