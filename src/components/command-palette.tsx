"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Check,
  Copy,
  Gamepad2,
  Globe,
  Library,
  Moon,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Rss,
  Search,
  Send,
  Sun,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { navigation } from "@/lib/site";
import { profile } from "@/data/profile";
import { socials } from "@/data/socials";
import {
  playerStore,
  playBlip,
  resetAchievements,
  setPaletteOpen,
  toggleCyberpunk,
  toggleSound,
  uiStore,
  usePlayer,
  useUi,
} from "@/lib/app-state";
import { cn } from "@/lib/utils";

type Group = "Go to" | "Actions" | "Elsewhere";

interface Command {
  id: string;
  label: string;
  hint?: string;
  group: Group;
  icon: LucideIcon;
  keywords?: string;
  /** Leave the palette open (used for actions that report inline). */
  keepOpen?: boolean;
  run: () => void;
}

const GROUP_ORDER: Group[] = ["Go to", "Actions", "Elsewhere"];

const PAGE_ICONS: Record<string, LucideIcon> = {
  "/": Globe,
  "/anime": BookOpen,
  "/manga": Library,
  "/games": Gamepad2,
  "/music": Music2,
  "/articles": Rss,
  "/resume": Briefcase,
  "/connect": Send,
};

export function CommandPalette() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { cyberpunk, sound, paletteOpen } = useUi();
  const player = usePlayer();

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = useMemo<Command[]>(() => {
    const pages: Command[] = navigation.map((item) => ({
      id: `go:${item.href}`,
      label: item.label,
      group: "Go to",
      icon: PAGE_ICONS[item.href] ?? ArrowRight,
      keywords: item.href,
      run: () => router.push(item.href),
    }));

    const isDark = resolvedTheme === "dark";
    const email = profile.email;

    const copyEmail: Command = {
      id: "copy-email",
      label: "Copy email",
      hint: email,
      group: "Actions",
      icon: copied ? Check : Copy,
      keywords: "email copy contact mail",
      keepOpen: true,
      run: () => {
        if (email) void navigator.clipboard?.writeText(email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
    };

    const actions: Command[] = [
      {
        id: "theme",
        label: isDark ? "Switch to light mode" : "Switch to dark mode",
        group: "Actions",
        icon: isDark ? Sun : Moon,
        keywords: "theme dark light appearance",
        run: () => setTheme(isDark ? "light" : "dark"),
      },
      {
        id: "cyberpunk",
        label: cyberpunk ? "Turn off cyberpunk mode" : "Turn on cyberpunk mode",
        group: "Actions",
        icon: Zap,
        keywords: "cyberpunk neon retro scanlines easter egg",
        run: () => toggleCyberpunk(),
      },
      {
        id: "sound",
        label: sound ? "Mute UI sounds" : "Unmute UI sounds",
        group: "Actions",
        icon: sound ? VolumeX : Volume2,
        keywords: "sound audio blip effects",
        run: () => toggleSound(),
      },
      {
        id: "player",
        label: player.playing ? "Pause the theme song" : "Play the theme song",
        group: "Actions",
        icon: player.playing ? Pause : Play,
        keywords: "music song play pause cyberpunk edgerunners",
        run: () => playerStore.get().toggle(),
      },
      {
        id: "mute",
        label: player.muted ? "Unmute the player" : "Mute the player",
        hint: "corner player",
        group: "Actions",
        icon: player.muted ? Volume2 : VolumeX,
        keywords: "mute volume player",
        run: () => playerStore.get().toggleMute(),
      },
      ...(email ? [copyEmail] : []),
      {
        id: "reset",
        label: "Reset achievements",
        group: "Actions",
        icon: RotateCcw,
        keywords: "achievements reset clear progress",
        run: () => resetAchievements(),
      },
    ];

    const elsewhere: Command[] = socials
      .filter((social) => !social.url.startsWith("mailto:"))
      .map((social) => ({
        id: `open:${social.platform}`,
        label: `Open ${social.label}`,
        hint: social.handle,
        group: "Elsewhere",
        icon: ArrowRight,
        keywords: `social ${social.platform} ${social.label}`,
        run: () => window.open(social.url, "_blank", "noopener,noreferrer"),
      }));

    return [...pages, ...actions, ...elsewhere];
  }, [
    router,
    resolvedTheme,
    setTheme,
    cyberpunk,
    sound,
    player.playing,
    player.muted,
    copied,
  ]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.group} ${command.keywords ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [commands, query]);

  // Clamp rather than reset in an effect, so the highlight never points past
  // the end of a freshly-filtered list.
  const safeActive = Math.min(active, Math.max(0, filtered.length - 1));

  const grouped = useMemo(() => {
    const indexById = new Map(
      filtered.map((command, index) => [command.id, index]),
    );
    return GROUP_ORDER.map((group) => ({
      group,
      items: filtered
        .filter((command) => command.group === group)
        .map((command) => ({ command, index: indexById.get(command.id) ?? 0 })),
    })).filter((entry) => entry.items.length > 0);
  }, [filtered]);

  const close = () => {
    setQuery("");
    setActive(0);
    setPaletteOpen(false);
  };

  const runCommand = (command: Command) => {
    command.run();
    playBlip(command.group === "Go to" ? "open" : "tap");
    if (!command.keepOpen) close();
  };

  // Global shortcut: ⌘K / Ctrl+K toggles, Escape closes.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(!uiStore.get().paletteOpen);
        return;
      }
      if (event.key === "Escape" && uiStore.get().paletteOpen) {
        setQuery("");
        setActive(0);
        setPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus the field on open; hand focus back to whatever had it on close.
  useEffect(() => {
    if (!paletteOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus?.();
  }, [paletteOpen]);

  if (!paletteOpen) return null;

  const activeId = `palette-option-${safeActive}`;

  return (
    <div className="fixed inset-0 z-[70] print:hidden">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="animate-palette absolute inset-x-0 top-[12vh] mx-auto w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-md border border-border bg-surface shadow-[0_18px_60px_rgb(0_0_0/0.4)]"
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive(Math.min(safeActive + 1, filtered.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive(Math.max(safeActive - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                const command = filtered[safeActive];
                if (command) runCommand(command);
              } else if (event.key === "Escape") {
                event.preventDefault();
                close();
              }
            }}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={filtered.length > 0 ? activeId : undefined}
            aria-autocomplete="list"
            aria-label="Search commands"
            placeholder="Jump to a page or run a command…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded-sm border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
            ESC
          </kbd>
        </div>

        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            No matches for “{query}”.
          </p>
        ) : (
          <div
            id="palette-list"
            role="listbox"
            aria-label="Commands"
            className="max-h-[min(24rem,55vh)] overflow-y-auto p-2"
          >
            {grouped.map(({ group, items }) => (
              <div role="group" aria-label={group} key={group} className="mb-1">
                <p
                  role="presentation"
                  className="px-2 py-1.5 text-[10px] font-semibold tracking-wider text-muted uppercase"
                >
                  {group}
                </p>
                {items.map(({ command, index }) => {
                  const Icon = command.icon;
                  const selected = index === safeActive;
                  return (
                    <div
                      key={command.id}
                      id={`palette-option-${index}`}
                      role="option"
                      aria-selected={selected}
                    >
                      <button
                        type="button"
                        onClick={() => runCommand(command)}
                        onMouseMove={() => setActive(index)}
                        tabIndex={-1}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                          selected
                            ? "bg-primary/10 text-foreground"
                            : "text-muted hover:bg-surface-muted",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            selected ? "text-primary" : "text-muted",
                          )}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {command.label}
                        </span>
                        {command.hint ? (
                          <span className="max-w-[45%] shrink-0 truncate font-mono text-[10px] text-muted">
                            {command.hint}
                          </span>
                        ) : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 border-t border-border px-3 py-2 text-[10px] text-muted">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded-sm border border-border bg-surface-muted px-1 font-mono">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded-sm border border-border bg-surface-muted px-1 font-mono">
              ↵
            </kbd>
            select
          </span>
        </div>
      </div>
    </div>
  );
}
