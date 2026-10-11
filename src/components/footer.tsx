import Link from "next/link";
import { Rss } from "lucide-react";
import { profile } from "@/data/profile";
import { SocialLinks } from "@/components/social-links";
import { Container } from "@/components/container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-surface/40">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="font-semibold">{profile.name}</p>
          <p className="max-w-sm text-sm text-muted">
            Built with Next.js and Tailwind. Content lives in typed data files —
            no CMS required.
          </p>
        </div>

        <div className="space-y-3">
          <SocialLinks />
          <div className="flex items-center gap-4 text-xs text-muted">
            <Link
              href="/feed.xml"
              className="inline-flex items-center gap-1.5 hover:text-primary"
            >
              <Rss className="h-3.5 w-3.5" aria-hidden="true" />
              RSS feed
            </Link>
            <span>
              © {year} {profile.name}
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
