"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Menu, Search, X } from "lucide-react";
import { navigation } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { setPaletteOpen } from "@/lib/app-state";

export function Navbar({ name, handle }: { name: string; handle: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile menu whenever the route changes — including browser
  // back/forward, which doesn't fire a click on a menu link. Adjusting state
  // during render is React's sanctioned pattern for "reset on prop change".
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && open) {
      setOpen(false);
      menuButtonRef.current?.focus();
    }
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md"
      style={{ viewTransitionName: "site-header" }}
    >
      <nav aria-label="Primary" onKeyDown={handleKeyDown}>
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-sm bg-primary font-display text-base font-semibold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden font-display text-sm font-semibold tracking-tight sm:block">
              {handle}
            </span>
          </Link>

          <ul className="hidden items-center gap-5 lg:flex">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "text-foreground underline decoration-primary decoration-2 underline-offset-[6px]"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Open command palette"
              title="Command palette (Ctrl/⌘ K)"
              className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-surface-muted px-2.5 text-xs font-medium text-muted transition-colors hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded-sm border border-border bg-surface px-1 py-0.5 font-mono text-[10px] md:inline">
                ⌘K
              </kbd>
            </button>
            <div className="hidden lg:block">
              <SoundToggle />
            </div>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-9 w-9 place-items-center rounded-sm border border-border bg-surface text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
            >
              {open ? (
                <X className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Kept mounted (hidden when closed) so aria-controls always resolves. */}
        <div
          id="mobile-menu"
          hidden={!open}
          className="border-t border-border bg-background lg:hidden"
        >
          <ul className="mx-auto grid w-full max-w-5xl gap-1 px-4 py-4 sm:px-6">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-sm border-l-2 px-3 py-2 text-sm font-medium",
                    isActive(item.href)
                      ? "border-primary bg-surface-muted text-foreground"
                      : "border-transparent text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto flex w-full max-w-5xl gap-2 px-4 pb-4 sm:px-6">
            <ThemeToggle />
            <SoundToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
