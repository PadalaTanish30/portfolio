import {
  AtSign,
  BookOpen,
  Briefcase,
  Camera,
  Code,
  Film,
  Gamepad2,
  Globe,
  Mail,
  MessageCircle,
  Music,
  Radio,
  Rss,
  Send,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Maps a platform key to a lucide-react icon.
 *
 * NOTE: lucide-react (v1.55) no longer ships brand/social logos, so generic
 * glyphs are used for social platforms while keeping the original keys intact.
 */
const ICONS: Record<string, LucideIcon> = {
  github: Code,
  gitlab: Code,
  x: AtSign,
  twitter: AtSign,
  youtube: Video,
  instagram: Camera,
  twitch: Radio,
  linkedin: Briefcase,
  email: Mail,
  mail: Mail,
  website: Globe,
  blog: Globe,
  rss: Rss,
  spotify: Music,
  music: Music,
  anilist: BookOpen,
  myanimelist: BookOpen,
  mal: BookOpen,
  steam: Gamepad2,
  discord: MessageCircle,
  telegram: Send,
  letterboxd: Film,
};

export function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const Icon = ICONS[platform.toLowerCase()];
  if (Icon) return <Icon className={className} aria-hidden="true" />;

  const initial = platform.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-surface-muted text-[0.7em] font-semibold leading-none text-muted",
        className,
      )}
    >
      {initial}
    </span>
  );
}
