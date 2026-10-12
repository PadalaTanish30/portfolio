"use client";

import { useEffect } from "react";
import { playBlip } from "@/lib/app-state";

/**
 * One delegated click listener for the whole site — far cheaper than wiring a
 * handler into every button. `playBlip` itself is a no-op unless the visitor
 * has opted into sounds, so this costs nothing when they haven't.
 */
export function SoundEngine() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const element = target?.closest("a, button, summary, [role='button']");
      if (!element) return;
      if (
        element.getAttribute("aria-disabled") === "true" ||
        (element as HTMLButtonElement).disabled
      ) {
        return;
      }
      playBlip(element.tagName === "A" ? "open" : "tap");
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
