"use client";

import { Volume2, VolumeX } from "lucide-react";
import { playBlip, toggleSound, useUi } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function SoundToggle({ className }: { className?: string }) {
  const { sound } = useUi();

  return (
    <button
      type="button"
      onClick={() => {
        toggleSound();
        playBlip("tap");
      }}
      aria-pressed={sound}
      aria-label={sound ? "Turn UI sounds off" : "Turn UI sounds on"}
      title={sound ? "UI sounds: on" : "UI sounds: off"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-sm border border-border bg-surface-muted text-muted transition-colors hover:border-primary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        sound && "border-primary text-primary",
        className,
      )}
    >
      {sound ? (
        <Volume2 className="h-4 w-4" aria-hidden="true" />
      ) : (
        <VolumeX className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
