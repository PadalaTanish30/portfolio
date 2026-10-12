/**
 * Small, discoverable milestones. Each one fires exactly once per browser and
 * surfaces as a toast (see `components/achievement-toaster.tsx`).
 *
 * `icon` is a key into the map in `achievement-toaster.tsx`, not a component —
 * keeping this file free of imports so it stays a plain data module.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "music" | "library" | "zap" | "file" | "send" | "terminal" | "gamepad";
}

export const achievements: Achievement[] = [
  {
    id: "player",
    title: "Now Playing",
    description: "Started the corner music player.",
    icon: "music",
  },
  {
    id: "shelves",
    title: "Shelf Explorer",
    description: "Visited the anime, manga, games and music shelves.",
    icon: "library",
  },
  {
    id: "palette",
    title: "Power User",
    description: "Opened the command palette with ⌘K.",
    icon: "terminal",
  },
  {
    id: "retro",
    title: "Netrunner",
    description: "Switched on cyberpunk mode.",
    icon: "zap",
  },
  {
    id: "konami",
    title: "↑↑↓↓",
    description: "You know the code. Respect.",
    icon: "gamepad",
  },
  {
    id: "resume",
    title: "Paper Trail",
    description: "Opened the résumé.",
    icon: "file",
  },
  {
    id: "connect",
    title: "Say Hello",
    description: "Dropped by the connect page.",
    icon: "send",
  },
];

export const achievementById = new Map(
  achievements.map((achievement) => [achievement.id, achievement]),
);
