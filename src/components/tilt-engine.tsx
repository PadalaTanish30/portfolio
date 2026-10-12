"use client";

import { useEffect } from "react";

/** Peak rotation at the corners, in degrees. Kept small — this is a nudge. */
const MAX_TILT = 5;

/**
 * A single delegated pointer listener gives every `[data-tilt]` card a subtle
 * 3D lean toward the cursor. Doing this globally (rather than shipping a client
 * component per card) keeps the media grids as server components and adds one
 * listener for the whole page.
 *
 * Disabled for coarse pointers (touch) and for reduced-motion.
 */
export function TiltEngine() {
  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let current: HTMLElement | null = null;
    let frame = 0;
    let clientX = 0;
    let clientY = 0;

    function clear(element: HTMLElement | null) {
      if (element) element.style.transform = "";
    }

    function render() {
      frame = 0;
      const element = current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const relativeX = (clientX - rect.left) / rect.width - 0.5;
      const relativeY = (clientY - rect.top) / rect.height - 0.5;
      element.style.transform = [
        "perspective(800px)",
        `rotateX(${(-relativeY * MAX_TILT).toFixed(2)}deg)`,
        `rotateY(${(relativeX * MAX_TILT).toFixed(2)}deg)`,
        "translateY(-2px)",
      ].join(" ");
    }

    function onPointerMove(event: PointerEvent) {
      clientX = event.clientX;
      clientY = event.clientY;

      const target =
        (event.target as Element | null)?.closest<HTMLElement>("[data-tilt]") ??
        null;

      if (target !== current) {
        clear(current);
        current = target;
      }
      if (!current || frame) return;
      frame = window.requestAnimationFrame(render);
    }

    function onPointerLeave() {
      clear(current);
      current = null;
    }

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", onPointerLeave);

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onPointerLeave);
      if (frame) window.cancelAnimationFrame(frame);
      clear(current);
    };
  }, []);

  return null;
}
