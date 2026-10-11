import type { Profile } from "@/lib/types";
import { ProfileSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// TODO: Replace everything in this file with your own details.
// This drives the Home page ("About" + "Now") and metadata.
// ---------------------------------------------------------------------------

const raw: Profile = {
  name: "Your Name",
  handle: "@yourhandle",
  pronouns: "they/them",
  tagline: "Developer, anime watcher, and chronic backlog collector.",
  location: "Your City, Country",
  email: "you@example.com",
  bio: [
    "Hi, I'm Your Name — I build things for the web and spend most of my free time buried in anime, manga, and games.",
    "This site is my corner of the internet: everything I'm watching, reading, playing and listening to, plus whatever I've written recently. Everything here is data-driven, so it stays up to date without me touching the layout.",
  ],
  now: {
    updated: "2026-10-01",
    focus: ["Building this portfolio", "Learning Rust", "Writing more often"],
    learning: ["Rust", "System design"],
  },
};

export const profile: Profile = ProfileSchema.parse(raw);
