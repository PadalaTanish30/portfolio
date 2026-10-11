import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide";
}) {
  const width = {
    narrow: "max-w-3xl",
    default: "max-w-5xl",
    wide: "max-w-7xl",
  }[size];

  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", width, className)}
    >
      {children}
    </div>
  );
}
