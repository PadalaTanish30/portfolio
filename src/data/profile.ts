import type { Profile } from "@/lib/types";
import { ProfileSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// Profile details. This drives the Home page ("About" + "Now") and metadata.
//
// `pronouns` and `location` are omitted deliberately — they are optional and
// are only rendered when set, so leaving them out hides the row entirely
// rather than showing placeholder text. Add them back when you want them shown.
//
// `tagline`, `bio`, and `now` are still generic copy — rewrite them in your
// own words.
// ---------------------------------------------------------------------------

const raw: Profile = {
  name: "Tanish Padala",
  handle: "@hey_tanish",
  tagline: "Developer, anime watcher, and chronic backlog collector.",
  email: "padalatanish30@gmail.com",
  bio: [
    "Hi, I'm Tanish Padala — I build things for the web and spend most of my free time buried in anime, manga, and games.",
    "This site is my corner of the internet: everything I'm watching, reading, playing and listening to, plus whatever I've written recently. Everything here is data-driven, so it stays up to date without me touching the layout.",
  ],
  now: {
    updated: "2026-10-11",
    focus: ["Building this portfolio", "Learning Rust", "Writing more often"],
    learning: ["Rust", "System design"],
  },
};

export const profile: Profile = ProfileSchema.parse(raw);
