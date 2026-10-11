import type { UpdateEntry } from "@/lib/types";
import { UpdateEntrySchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// MANUAL UPDATES
//
// Anything you want to announce that isn't in an RSS feed: a new project, a
// milestone, a site change, an event. These always show on the Articles page
// (and in the RSS feed) alongside your fetched articles.
//
// kind: "blog" | "video" | "post" | "release" | "note" | "stream"
// ---------------------------------------------------------------------------

export const updates: UpdateEntry[] = UpdateEntrySchema.array().parse([
  {
    id: "site-launch",
    title: "New site is live",
    date: "2026-10-01",
    kind: "release",
    summary:
      "Rebuilt my corner of the internet: auto-synced anime & manga, a games + UID page, and a feed that collects everything I post.",
    pinned: true,
  },
  {
    id: "example-note",
    title: "Example update — edit me in src/data/updates.ts",
    date: "2026-09-20",
    kind: "note",
    summary:
      "Add, edit or remove entries here. Each one automatically appears on the Articles page and in /feed.xml.",
  },
]);
