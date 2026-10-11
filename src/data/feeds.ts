import type { FeedSource } from "@/lib/types";
import { FeedSourceSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// ARTICLES FEED — external sources
//
// Add an entry for every place you publish. The Articles page fetches each
// feed at build time (and revalidates every few hours) and merges the newest
// items into one reverse-chronological list.
//
// Where to find your feed URL:
//   GitHub (user activity)  https://github.com/<user>.atom
//   dev.to                  https://dev.to/feed/<username>
//   Medium                  https://medium.com/feed/@<username>
//   Substack                https://<name>.substack.com/feed
//   Hashnode                https://<name>.hashnode.dev/rss.xml
//   YouTube (channel)       https://www.youtube.com/feeds/videos.xml?channel_id=<id>
//   Reddit (user)           https://www.reddit.com/user/<user>/.rss
//   Bluesky                 https://bsky.app/profile/<handle>.rss
//   Personal blog (RSS)     https://example.com/feed.xml
//
// Set `enabled: true` once you've replaced the placeholder URL.
// ---------------------------------------------------------------------------

export const feedSources: FeedSource[] = FeedSourceSchema.array().parse([
  {
    name: "My Blog",
    url: "https://example.com/feed.xml",
    platform: "website",
    enabled: false,
  },
  {
    name: "dev.to",
    url: "https://dev.to/feed/yourhandle",
    platform: "devto",
    enabled: false,
  },
  {
    name: "Medium",
    url: "https://medium.com/feed/@yourhandle",
    platform: "medium",
    enabled: false,
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID",
    platform: "youtube",
    enabled: false,
  },
  {
    name: "GitHub",
    url: "https://github.com/yourhandle.atom",
    platform: "github",
    enabled: false,
  },
]);

/** Max number of articles shown on the Articles page. */
export const MAX_ARTICLES = 40;
