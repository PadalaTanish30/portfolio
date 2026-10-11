import { afterEach, describe, expect, it, vi } from "vitest";
import type { FeedSource } from "@/lib/types";
import { fetchFeed, parseFeed } from "@/lib/feeds";

const source: FeedSource = {
  name: "Test Blog",
  url: "https://blog.example.com/feed.xml",
  platform: "blog",
  enabled: true,
};

const RSS = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Blog</title>
    <item>
      <title>Hello &amp; welcome</title>
      <link>https://blog.example.com/posts/hello</link>
      <pubDate>Thu, 12 Mar 2026 10:00:00 GMT</pubDate>
      <description>&lt;p&gt;A &lt;b&gt;post&lt;/b&gt;&lt;/p&gt;</description>
      <category>tech</category>
      <category>life</category>
    </item>
    <item>
      <title>Undated</title>
      <link>https://blog.example.com/posts/undated</link>
    </item>
  </channel>
</rss>`;

const ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Atom Feed</title>
  <entry>
    <title>Atom post</title>
    <link rel="self" href="https://blog.example.com/atom/1/self"/>
    <link rel="alternate" href="https://blog.example.com/atom/1"/>
    <updated>2026-03-10T08:00:00Z</updated>
    <summary>Short summary</summary>
    <category term="dev"/>
  </entry>
</feed>`;

const RDF = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns="http://purl.org/rss/1.0/">
  <item>
    <title>RDF item</title>
    <link>https://blog.example.com/rdf</link>
    <dc:date>2026-02-01T00:00:00Z</dc:date>
  </item>
</rdf:RDF>`;

/** A minimal stand-in for the parts of `Response` that `fetchFeed` reads. */
function fakeResponse(
  body: string,
  init: { status?: number; contentLength?: number | null } = {},
) {
  const { status = 200, contentLength = null } = init;
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "content-length" && contentLength !== null
          ? String(contentLength)
          : null,
    },
    text: async () => body,
  } as unknown as Response;
}

describe("parseFeed — RSS 2.0", () => {
  const articles = parseFeed(RSS, source);

  it("extracts every item", () => {
    expect(articles).toHaveLength(2);
  });

  it("decodes entities, strips HTML from the summary and keeps tags", () => {
    expect(articles[0]).toMatchObject({
      title: "Hello & welcome",
      url: "https://blog.example.com/posts/hello",
      source: "Test Blog",
      platform: "blog",
      publishedAt: "2026-03-12T10:00:00.000Z",
      summary: "A post",
      tags: ["tech", "life"],
    });
  });

  it("falls back to the epoch for a missing date", () => {
    expect(articles[1]?.publishedAt).toBe("1970-01-01T00:00:00.000Z");
  });
});

describe("parseFeed — Atom", () => {
  const articles = parseFeed(ATOM, source);

  it("prefers the rel=alternate link", () => {
    expect(articles[0]?.url).toBe("https://blog.example.com/atom/1");
  });

  it("reads the updated date, summary and category term", () => {
    expect(articles[0]).toMatchObject({
      title: "Atom post",
      publishedAt: "2026-03-10T08:00:00.000Z",
      summary: "Short summary",
      tags: ["dev"],
    });
  });
});

describe("parseFeed — RSS 1.0 / RDF", () => {
  it("extracts items from an RDF document", () => {
    const articles = parseFeed(RDF, source);
    expect(articles).toHaveLength(1);
    expect(articles[0]).toMatchObject({
      title: "RDF item",
      url: "https://blog.example.com/rdf",
      publishedAt: "2026-02-01T00:00:00.000Z",
    });
  });
});

describe("parseFeed — link handling and hardening", () => {
  it("resolves site-relative links against the feed URL", () => {
    const xml = `<rss><channel><item><title>Rel</title><link>/posts/rel</link></item></channel></rss>`;
    expect(parseFeed(xml, source)[0]?.url).toBe(
      "https://blog.example.com/posts/rel",
    );
  });

  it("drops items with a dangerous scheme", () => {
    const xml = `<rss><channel><item><title>XSS</title><link>javascript:alert(1)</link></item></channel></rss>`;
    expect(parseFeed(xml, source)).toHaveLength(0);
  });

  it("drops items with no link", () => {
    const xml = `<rss><channel><item><title>No link</title></item></channel></rss>`;
    expect(parseFeed(xml, source)).toHaveLength(0);
  });

  it("caps tags at four and truncates long titles", () => {
    const longTitle = "x".repeat(300);
    const xml = `<rss><channel><item><title>${longTitle}</title><link>https://blog.example.com/a</link><category>1</category><category>2</category><category>3</category><category>4</category><category>5</category></item></channel></rss>`;
    const articles = parseFeed(xml, source);
    expect(articles[0]?.tags).toHaveLength(4);
    expect((articles[0]?.title ?? "").length).toBeLessThanOrEqual(200);
  });

  it("returns an empty array for empty input", () => {
    expect(parseFeed("", source)).toHaveLength(0);
  });
});

describe("fetchFeed", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("rejects a non-http(s) source URL before fetching", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(
      fetchFeed({ ...source, url: "ftp://example.com/feed" }),
    ).rejects.toThrow(/http/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("parses a successful response", async () => {
    const fetchMock = vi.fn(async () => fakeResponse(RSS));
    vi.stubGlobal("fetch", fetchMock);
    const articles = await fetchFeed(source);
    expect(articles).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws on a non-OK HTTP status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => fakeResponse("", { status: 500 })),
    );
    await expect(fetchFeed(source)).rejects.toThrow("HTTP 500");
  });

  it("refuses a response whose declared size is too large", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => fakeResponse(RSS, { contentLength: 3_000_000 })),
    );
    await expect(fetchFeed(source)).rejects.toThrow(/too large/);
  });

  it("refuses an oversized body even without a content-length header", async () => {
    const huge = "a".repeat(2_000_001);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => fakeResponse(huge)),
    );
    await expect(fetchFeed(source)).rejects.toThrow(/too large/);
  });

  it("caps the number of items taken from a single feed", async () => {
    const items = Array.from(
      { length: 250 },
      (_, i) =>
        `<item><title>t${i}</title><link>https://blog.example.com/${i}</link></item>`,
    ).join("");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => fakeResponse(`<rss><channel>${items}</channel></rss>`)),
    );
    await expect(fetchFeed(source)).resolves.toHaveLength(200);
  });
});
