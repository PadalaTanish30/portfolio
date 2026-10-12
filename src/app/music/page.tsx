import type { Metadata } from "next";
import { music } from "@/data/music";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { MusicCard } from "@/components/music-card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Music",
  description: "My favourite artists, albums and tracks.",
};

export default function MusicPage() {
  const favourites = music.filter((entry) => entry.favourite);
  const rest = music.filter((entry) => !entry.favourite);

  return (
    <Container size="narrow">
      <PageHeader
        title="What I'm listening to"
        description="Artists, albums and tracks I keep coming back to. Links open in Spotify or YouTube."
      />

      {music.length === 0 ? (
        <EmptyState
          title="No music yet"
          description="Add entries in src/data/music.ts."
        />
      ) : (
        <div className="space-y-10">
          {favourites.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
                Favourites
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {favourites.map((entry) => (
                  <MusicCard key={entry.id} entry={entry} />
                ))}
              </ul>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
                More
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {rest.map((entry) => (
                  <MusicCard key={entry.id} entry={entry} />
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </Container>
  );
}
