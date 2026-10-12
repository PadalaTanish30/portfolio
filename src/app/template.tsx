import type { ReactNode } from "react";
import { ViewTransition } from "react";

/**
 * Route transitions, the documented Next.js way.
 *
 * A `template` (unlike a `layout`) gets a fresh instance on every navigation,
 * so the outgoing tree "exits" and the incoming tree "enters" — exactly what
 * React's `<ViewTransition>` needs to hand the browser two snapshots to animate
 * between. Putting this in the layout instead would not work: layouts persist.
 *
 * The `page-in` / `page-out` animations live in `globals.css`. Browser support
 * is progressive — without the View Transitions API the page simply swaps, and
 * `prefers-reduced-motion` skips the animation entirely.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out">
      {children}
    </ViewTransition>
  );
}
