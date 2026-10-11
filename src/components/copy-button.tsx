"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied!",
  ariaLabel,
  className,
  size = "md",
}: {
  value: string;
  label?: string;
  copiedLabel?: string;
  /** Optional accessible name when the visible label is generic (e.g. "Copy"). */
  ariaLabel?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={
        copied ? `${ariaLabel ?? label} — copied` : (ariaLabel ?? label)
      }
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface font-medium transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-9 px-3 text-sm",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
