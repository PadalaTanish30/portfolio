import type { Game, GameUID } from "@/lib/types";
import { GameSchema, GameUIDSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// VIDEO GAMES
// status: "playing" | "completed" | "backlog" | "on_hold" | "dropped"
// ---------------------------------------------------------------------------

export const games: Game[] = GameSchema.array().parse([
  {
    id: "elden-ring",
    title: "Elden Ring",
    coverImage:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg",
    status: "playing",
    platform: "PC",
    hoursPlayed: 142,
    score: 96,
    link: "https://store.steampowered.com/app/1245620/ELDEN_RING/",
    favourite: true,
  },
  {
    id: "hades-2",
    title: "Hades II",
    coverImage:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1145350/header.jpg",
    status: "playing",
    platform: "PC",
    hoursPlayed: 38,
    score: 90,
    link: "https://store.steampowered.com/app/1145350/Hades_II/",
  },
  {
    id: "clair-obscur",
    title: "Clair Obscur: Expedition 33",
    coverImage:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1903340/header.jpg",
    status: "completed",
    platform: "PS5",
    hoursPlayed: 62,
    score: 94,
    link: "https://store.steampowered.com/app/1903340/",
  },
  {
    id: "hollow-knight-silksong",
    title: "Hollow Knight: Silksong",
    coverImage:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1030300/header.jpg",
    status: "backlog",
    platform: "PC",
    link: "https://store.steampowered.com/app/1030300/",
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    coverImage:
      "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg",
    status: "backlog",
    platform: "PC",
    score: 97,
    link: "https://store.steampowered.com/app/1086940/",
  },
  {
    id: "zelda-totk",
    title: "The Legend of Zelda: Tears of the Kingdom",
    status: "completed",
    platform: "Switch",
    hoursPlayed: 110,
    score: 95,
  },
]);

// ---------------------------------------------------------------------------
// GAME UIDs — share your player IDs so people can add you.
// Add one entry per game/account.
// ---------------------------------------------------------------------------

export const gameUIDs: GameUID[] = GameUIDSchema.array().parse([
  {
    game: "Genshin Impact",
    uid: "800000000",
    region: "EU",
    platform: "PC / PS5",
    note: "AR 60 — main",
  },
  {
    game: "Honkai: Star Rail",
    uid: "700000000",
    region: "EU",
    platform: "PC",
    note: "TL 70",
  },
  {
    game: "Zenless Zone Zero",
    uid: "1000000000",
    region: "Europe",
    platform: "PC",
  },
  {
    game: "Valorant",
    uid: "YourName#TAG",
    region: "EU",
    platform: "PC",
    note: "Casual",
  },
  {
    game: "Steam",
    uid: "your_steam_id",
    region: "Global",
    platform: "PC",
    note: "Friend code",
    link: "https://steamcommunity.com/id/yourhandle",
  },
  {
    game: "Epic Games",
    uid: "your_epic_username",
    region: "Global",
    platform: "PC",
  },
  {
    game: "Nintendo Switch",
    uid: "SW-0000-0000-0000",
    region: "EU",
    platform: "Switch",
  },
  {
    game: "PlayStation Network",
    uid: "your_psn_id",
    region: "EU",
    platform: "PS5",
  },
]);
