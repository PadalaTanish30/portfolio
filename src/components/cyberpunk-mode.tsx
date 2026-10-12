"use client";

import { useEffect } from "react";
import { toggleCyberpunk, uiStore, unlock } from "@/lib/app-state";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null;
  if (!element) return false;
  const tag = element.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    element.isContentEditable
  );
}

/**
 * Reflects the cyberpunk flag onto `<html>` and listens for the Konami code.
 *
 * Updating the class list is a side effect on an external system, so it is
 * driven from the store subscription rather than React state.
 */
export function CyberpunkMode() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () =>
      root.classList.toggle("cyberpunk", uiStore.get().cyberpunk);
    apply();
    const unsubscribe = uiStore.subscribe(apply);

    let index = 0;
    function onKeyDown(event: KeyboardEvent) {
      // Never eat keystrokes aimed at the palette's search field.
      if (isTyping(event.target)) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      if (key === KONAMI[index]) {
        index += 1;
        if (index === KONAMI.length) {
          index = 0;
          toggleCyberpunk();
          unlock("konami");
        }
        return;
      }

      // Restart, allowing the first key to also begin a new sequence.
      index = key === KONAMI[0] ? 1 : 0;
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      unsubscribe();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
