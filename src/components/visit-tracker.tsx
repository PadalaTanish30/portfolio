"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { markVisited, unlock } from "@/lib/app-state";

/**
 * Awards achievements that depend on where the visitor has been. Rendered once
 * in the layout, it re-runs on every navigation.
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    markVisited(pathname);
    if (pathname === "/resume") unlock("resume");
    if (pathname === "/connect") unlock("connect");
  }, [pathname]);

  return null;
}
