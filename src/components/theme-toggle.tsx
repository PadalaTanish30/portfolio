"use client";

import {
  useRef,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

type ThemeValue = (typeof OPTIONS)[number]["value"];

/**
 * `true` only after hydration. Using useSyncExternalStore (server snapshot
 * `false`, client snapshot `true`) avoids the `setState`-in-effect pattern
 * while staying hydration-safe — the theme value isn't known until the client
 * reads localStorage, and rendering it on the server would mismatch.
 * The snapshot is a primitive, so it's stable and can't cause a render loop.
 */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Three mutually exclusive options, so this is a radiogroup: a single tab stop
 * with roving tabindex, navigated by arrow keys (WCAG-idiomatic, and the
 * position is announced by screen readers).
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = mounted
    ? OPTIONS.findIndex((option) => option.value === theme)
    : -1;
  // Keep exactly one option tabbable even before the stored theme is known.
  const tabbableIndex = activeIndex >= 0 ? activeIndex : 0;

  function handleKeyDown(
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let next = index;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        next = (index + 1) % OPTIONS.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        next = (index - 1 + OPTIONS.length) % OPTIONS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = OPTIONS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setTheme(OPTIONS[next].value as ThemeValue);
    buttonRefs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-muted p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }, index) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            ref={(element) => {
              buttonRefs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            tabIndex={index === tabbableIndex ? 0 : -1}
            onClick={() => setTheme(value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "rounded-full p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              active
                ? "bg-surface text-primary shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
