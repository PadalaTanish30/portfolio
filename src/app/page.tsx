import Link from "next/link";
import { BookOpen, Gamepad2, Library, Music2, Sparkles } from "lucide-react";
import { profile } from "@/data/profile";
import { games } from "@/data/games";
import { music } from "@/data/music";
import {
  getAnimeList,
  getMangaList,
  isAnimeSyncConfigured,
} from "@/lib/anilist";
import { getUpdates } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/container";
import { Card } from "@/components/card";
import { Badge } from "@/components/badge";
import { Avatar } from "@/components/avatar";
import { ButtonLink } from "@/components/button-link";
import { SocialLinks } from "@/components/social-links";
import { Section } from "@/components/section";

// Must be a literal — Next route segment config is statically analysed.
export const revalidate = 21600; // 6 hours

export default async function HomePage() {
  const [anime, manga] = await Promise.all([getAnimeList(), getMangaList()]);
  const updates = getUpdates().slice(0, 3);

  const animeWatching = anime.entries.filter((e) => e.status === "watching");
  const mangaReading = manga.entries.filter((e) => e.status === "reading");
  const playing = games.filter((g) => g.status === "playing");
  const synced = isAnimeSyncConfigured();

  const stats = [
    {
      href: "/anime",
      label: "Anime",
      value: anime.entries.length,
      detail: `${animeWatching.length} watching`,
      Icon: Library,
    },
    {
      href: "/manga",
      label: "Manga",
      value: manga.entries.length,
      detail: `${mangaReading.length} reading`,
      Icon: BookOpen,
    },
    {
      href: "/games",
      label: "Games",
      value: games.length,
      detail: `${playing.length} playing`,
      Icon: Gamepad2,
    },
    {
      href: "/music",
      label: "Music",
      value: music.length,
      detail: "favourite picks",
      Icon: Music2,
    },
  ];

  return (
    <Container>
      {/* Hero — a printed masthead: warm stock, one ink wash, and the
          signature riso misregistration behind the name. */}
      <section className="hero-wash animate-rise relative overflow-hidden rounded-md border border-border p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="halftone pointer-events-none absolute -right-4 -top-4 h-28 w-28 opacity-25 sm:h-40 sm:w-40"
        />
        <div className="relative flex flex-col gap-6">
          <Avatar name={profile.name} src={profile.avatar} size={96} />
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="riso-ink font-display text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
                {profile.name}
              </h1>
              {profile.pronouns ? <Badge>{profile.pronouns}</Badge> : null}
            </div>
            <p className="max-w-xl text-lg text-pretty text-muted">
              {profile.tagline}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>{profile.handle}</span>
              {profile.location ? <span>{profile.location}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ButtonLink href="/resume">View résumé</ButtonLink>
            <ButtonLink href="/connect" variant="secondary">
              Connect
            </ButtonLink>
            <ButtonLink href="/articles" variant="ghost">
              Latest articles
            </ButtonLink>
          </div>

          <SocialLinks />
        </div>
      </section>

      {/* About + Now */}
      <div className="mt-14 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Section title="About">
          <Card className="space-y-4">
            {profile.bio.map((paragraph) => (
              <p
                key={paragraph.slice(0, 24)}
                className="leading-relaxed text-muted"
              >
                {paragraph}
              </p>
            ))}
          </Card>
        </Section>

        <Section
          title="Now"
          description={`Updated ${formatDate(profile.now.updated)}`}
        >
          <Card className="space-y-4">
            <NowRow label="Focus" values={profile.now.focus} />
            <NowRow label="Learning" values={profile.now.learning} />
            {playing[0] ? (
              <NowRow label="Playing" values={[playing[0].title]} />
            ) : null}
            {animeWatching[0] ? (
              <NowRow label="Watching" values={[animeWatching[0].title]} />
            ) : null}
            {mangaReading[0] ? (
              <NowRow label="Reading" values={[mangaReading[0].title]} />
            ) : null}
          </Card>
        </Section>
      </div>

      {/* Browse — a hairline grid, set like a printed table. */}
      <Section title="Browse" className="mt-14">
        <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border lg:grid-cols-4">
          {stats.map(({ href, label, value, detail, Icon }) => (
            <li key={href} className="bg-surface">
              <Link
                href={href}
                className="flex h-full flex-col gap-3 p-4 transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-display text-3xl font-semibold tabular-nums tracking-tight">
                    {value}
                  </p>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted">{detail}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Latest updates */}
      <Section
        title="Latest updates"
        className="mt-14"
        action={
          <Link
            href="/articles"
            className="text-sm font-medium text-primary hover:underline"
          >
            All articles
          </Link>
        }
      >
        <div className="space-y-3">
          {updates.map((update) => (
            <Card key={update.id} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <Badge variant="primary">{update.kind}</Badge>
                <time dateTime={update.date}>{formatDate(update.date)}</time>
              </div>
              <p className="font-semibold">{update.title}</p>
              {update.summary ? (
                <p className="text-sm text-muted">{update.summary}</p>
              ) : null}
            </Card>
          ))}
        </div>
      </Section>

      <p className="mt-10 flex items-center gap-2 text-xs text-muted">
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Lists{" "}
        {synced
          ? "are auto-synced from AniList / MyAnimeList"
          : "come from local data files"}{" "}
        and refresh automatically.
      </p>
    </Container>
  );
}

function NowRow({ label, values }: { label: string; values: string[] }) {
  if (!values || values.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium text-muted">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <li
            key={value}
            className="rounded-sm border border-border bg-surface-muted px-2.5 py-1 text-sm"
          >
            {value}
          </li>
        ))}
      </ul>
    </div>
  );
}
