"use client";

/**
 * Client-only application state.
 *
 * This module is intentionally excluded from the Vitest coverage run (see
 * `vitest.config.mts`): it touches `window`, `localStorage` and the Web Audio
 * API, none of which exist in the node test environment. The reusable piece —
 * `createStore` — lives in `@/lib/store` and *is* tested.
 *
 * Everything here is read through `useSyncExternalStore`, using a server
 * snapshot, so components render identically on the server and hydrate without
 * a mismatch.
 */

import { useCallback, useSyncExternalStore } from "react";
import { createStore, type Store } from "@/lib/store";

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useStore<T>(store: Store<T>, serverSnapshot: T): T {
  const getServerSnapshot = useCallback(() => serverSnapshot, [serverSnapshot]);
  return useSyncExternalStore(store.subscribe, store.get, getServerSnapshot);
}

/* -------------------------------------------------------------------------- */
/*  Local storage helpers                                                      */
/* -------------------------------------------------------------------------- */

function readFlag(key: string, fallback = false): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === "1";
  } catch {
    return fallback;
  }
}

function writeFlag(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* private mode — preferences simply won't persist */
  }
}

function readList(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* -------------------------------------------------------------------------- */
/*  UI preferences                                                             */
/* -------------------------------------------------------------------------- */

export interface UiState {
  /** Cyberpunk easter egg: scanlines + neon ink. */
  cyberpunk: boolean;
  /** Opt-in Web Audio blips. Off by default; never autoplays. */
  sound: boolean;
  /** Command palette visibility. Deliberately not persisted. */
  paletteOpen: boolean;
}

export const UI_SERVER_STATE: UiState = {
  cyberpunk: false,
  sound: false,
  paletteOpen: false,
};

export const uiStore = createStore<UiState>({
  cyberpunk: readFlag("ui:cyberpunk"),
  sound: readFlag("ui:sound"),
  paletteOpen: false,
});

export function setCyberpunk(value: boolean): void {
  writeFlag("ui:cyberpunk", value);
  uiStore.set((state) => ({ ...state, cyberpunk: value }));
  if (value) unlock("retro");
}

export function toggleCyberpunk(): void {
  setCyberpunk(!uiStore.get().cyberpunk);
}

export function setSound(value: boolean): void {
  writeFlag("ui:sound", value);
  uiStore.set((state) => ({ ...state, sound: value }));
}

export function toggleSound(): void {
  setSound(!uiStore.get().sound);
}

export function setPaletteOpen(value: boolean): void {
  uiStore.set((state) =>
    state.paletteOpen === value ? state : { ...state, paletteOpen: value },
  );
  if (value) unlock("palette");
}

export function useUi(): UiState {
  return useStore(uiStore, UI_SERVER_STATE);
}

/* -------------------------------------------------------------------------- */
/*  Player bridge                                                              */
/* -------------------------------------------------------------------------- */

export interface PlayerState {
  started: boolean;
  playing: boolean;
  muted: boolean;
  /** Imperative controls, published by the corner player on mount. */
  toggle: () => void;
  toggleMute: () => void;
}

const noop = () => {};

export const PLAYER_SERVER_STATE: PlayerState = {
  started: false,
  playing: false,
  muted: false,
  toggle: noop,
  toggleMute: noop,
};

export const playerStore = createStore<PlayerState>(PLAYER_SERVER_STATE);

export function usePlayer(): PlayerState {
  return useStore(playerStore, PLAYER_SERVER_STATE);
}

/** Patch the observable part of the player (never the imperative controls). */
export function setPlayer(
  patch: Partial<Pick<PlayerState, "started" | "playing" | "muted">>,
): void {
  playerStore.set((state) => ({ ...state, ...patch }));
}

/** Publish the iframe controls once the player has mounted. */
export function publishPlayerControls(
  controls: Pick<PlayerState, "toggle" | "toggleMute">,
): void {
  playerStore.set((state) => ({ ...state, ...controls }));
}

/* -------------------------------------------------------------------------- */
/*  Achievements                                                               */
/* -------------------------------------------------------------------------- */

const UNLOCKED_KEY = "achievements:unlocked";
const VISITED_KEY = "achievements:visited";

export interface Toast {
  id: string;
  /** Unique per unlock so a repeated id can still animate a fresh toast. */
  nonce: number;
}

export interface AchievementState {
  unlocked: string[];
  toasts: Toast[];
}

export const ACHIEVEMENT_SERVER_STATE: AchievementState = {
  unlocked: [],
  toasts: [],
};

export const achievementStore = createStore<AchievementState>({
  unlocked: readList(UNLOCKED_KEY),
  toasts: [],
});

let toastNonce = 0;

/** Unlock once, then push a toast. Safe to call repeatedly. */
export function unlock(id: string): void {
  const { unlocked } = achievementStore.get();
  if (unlocked.includes(id)) return;

  const nextUnlocked = [...unlocked, id];
  writeList(UNLOCKED_KEY, nextUnlocked);
  achievementStore.set((state) => ({
    unlocked: nextUnlocked,
    toasts: [...state.toasts, { id, nonce: ++toastNonce }],
  }));
}

export function dismissToast(nonce: number): void {
  achievementStore.set((state) => ({
    ...state,
    toasts: state.toasts.filter((toast) => toast.nonce !== nonce),
  }));
}

export function resetAchievements(): void {
  writeList(UNLOCKED_KEY, []);
  writeList(VISITED_KEY, []);
  achievementStore.set({ unlocked: [], toasts: [] });
}

export function useAchievements(): AchievementState {
  return useStore(achievementStore, ACHIEVEMENT_SERVER_STATE);
}

/** Shelves that must all be visited for the "Shelf Explorer" achievement. */
const SHELVES = ["/anime", "/manga", "/games", "/music"];

export function markVisited(pathname: string): void {
  if (!SHELVES.includes(pathname)) return;

  const visited = new Set(readList(VISITED_KEY));
  if (visited.has(pathname)) return;
  visited.add(pathname);
  writeList(VISITED_KEY, [...visited]);

  if (SHELVES.every((shelf) => visited.has(shelf))) unlock("shelves");
}

/* -------------------------------------------------------------------------- */
/*  Sound                                                                      */
/* -------------------------------------------------------------------------- */

type Blip = "tap" | "open" | "unlock";

const TONES: Record<Blip, { frequency: number; duration: number }> = {
  tap: { frequency: 520, duration: 0.1 },
  open: { frequency: 680, duration: 0.12 },
  unlock: { frequency: 880, duration: 0.22 },
};

let audioContext: AudioContext | null = null;
let lastBlipAt = 0;

/**
 * A deliberately tiny synth blip — no audio files, no licences, no downloads.
 * Only ever called from a user gesture (a click), and only when sounds are on.
 */
export function playBlip(kind: Blip = "tap"): void {
  if (typeof window === "undefined" || !uiStore.get().sound) return;

  // A mouse click reaches us twice: once from the delegated listener in
  // `SoundEngine`, once from the explicit call (which exists to cover keyboard
  // activation). Collapse the pair into a single blip.
  const at = performance.now();
  if (at - lastBlipAt < 40) return;
  lastBlipAt = at;

  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return;

  try {
    audioContext ??= new Ctor();
    const context = audioContext;
    if (context.state === "suspended") void context.resume();

    const { frequency, duration } = TONES[kind];
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.4,
      now + duration,
    );

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch {
    /* audio is a nicety — never let it break a click */
  }
}
