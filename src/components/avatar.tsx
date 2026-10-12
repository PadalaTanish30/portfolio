import Image from "next/image";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
  size = 112,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const useImage = Boolean(src) && !src?.endsWith(".svg");

  if (useImage && src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn(
          "rounded-md border border-border object-cover",
          className,
        )}
        style={{ width: size, height: size }}
        priority
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-md border border-border bg-surface-muted font-display text-3xl font-semibold text-primary",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials(name) || "?"}
    </div>
  );
}
