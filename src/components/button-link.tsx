import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const styles = {
  primary:
    "bg-primary text-primary-foreground border border-transparent hover:opacity-90",
  secondary:
    "bg-surface text-foreground border border-border hover:bg-surface-muted",
  ghost:
    "bg-transparent text-foreground hover:bg-surface-muted border border-transparent",
  outline:
    "bg-transparent text-primary border border-primary/40 hover:bg-primary/10",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  external = false,
  title,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof styles;
  size?: keyof typeof sizes;
  className?: string;
  external?: boolean;
  title?: string;
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-medium transition-[transform,opacity,background-color,border-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:translate-y-px",
    styles[variant],
    sizes[size],
    className,
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        title={title}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} title={title}>
      {children}
    </Link>
  );
}
