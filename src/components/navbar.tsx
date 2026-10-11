"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Menu, X } from "lucide-react";
import { navigation } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <nav aria-label="Primary" onKeyDown={handleKeyDown}>
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm sm:block">{handle}</span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-surface-muted text-foreground"
                      : "text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
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
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary lg:hidden"
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
                    "block rounded-xl px-3 py-2 text-sm font-medium",
                    isActive(item.href)
                      ? "bg-surface-muted text-foreground"
                      : "text-muted hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto w-full max-w-5xl px-4 pb-4 sm:px-6">
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}
