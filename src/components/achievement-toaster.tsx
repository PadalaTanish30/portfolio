"use client";

import { useEffect } from "react";
import {
  FileText,
  Gamepad2,
  Library,
  Music2,
  Send,
  Terminal,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { achievementById } from "@/data/achievements";
import { dismissToast, playBlip, useAchievements } from "@/lib/app-state";

const ICONS: Record<string, LucideIcon> = {
  music: Music2,
  library: Library,
  zap: Zap,
  file: FileText,
  send: Send,
  terminal: Terminal,
  gamepad: Gamepad2,
};

const VISIBLE_MS = 5200;

/**
 * Bottom-left stack of unlock toasts. Kept clear of the corner player on the
 * right. Each toast is announced politely and auto-dismisses.
 */
export function AchievementToaster() {
  const { toasts } = useAchievements();

  useEffect(() => {
    if (toasts.length === 0) return;
    playBlip("unlock");
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.nonce), VISIBLE_MS),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [toasts]);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-50 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2 print:hidden"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const achievement = achievementById.get(toast.id);
        if (!achievement) return null;
        const Icon = ICONS[achievement.icon] ?? Zap;

        return (
          <div
            key={toast.nonce}
            role="status"
            className="animate-toast pointer-events-auto flex items-start gap-3 rounded-md border border-border bg-surface p-3 shadow-[var(--shadow-lift)]"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                Achievement unlocked
              </p>
              <p className="truncate text-sm font-semibold">
                {achievement.title}
              </p>
              <p className="text-xs text-muted">{achievement.description}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.nonce)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-sm text-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
