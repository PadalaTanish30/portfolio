import Link from "next/link";
import { socials } from "@/data/socials";
import { PlatformIcon } from "@/components/platform-icon";
import { cn } from "@/lib/utils";

export function SocialLinks({
  className,
  itemClassName,
  showLabels = false,
}: {
  className?: string;
  itemClassName?: string;
  showLabels?: boolean;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {socials.map((social) => {
        const isExternal = !social.url.startsWith("mailto:");
        const content = (
          <>
            <PlatformIcon platform={social.platform} className="h-4 w-4" />
            {showLabels ? (
              <span>{social.label}</span>
            ) : (
              <span className="sr-only">{social.label}</span>
            )}
          </>
        );

        const classes = cn(
          "inline-flex items-center gap-2 rounded-sm border border-border bg-surface p-2.5 text-sm font-medium transition-colors hover:border-primary hover:text-primary",
          showLabels && "px-3.5 py-2",
          itemClassName,
        );

        return (
          <li key={social.platform}>
            {isExternal ? (
              <a
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes}
                title={social.label}
              >
                {content}
              </a>
            ) : (
              <Link href={social.url} className={classes} title={social.label}>
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
