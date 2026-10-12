import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section" | "li";
}) {
  return (
    <Tag
      className={cn(
        "rounded-md border border-border bg-surface p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
