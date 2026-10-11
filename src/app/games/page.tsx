import type { Metadata } from "next";
import { games, gameUIDs } from "@/data/games";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { GameCard } from "@/components/game-card";
import { UidTable } from "@/components/uid-table";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Games",
  description: "What I'm playing now, my backlog, and how to add me in-game.",
};

export default function GamesPage() {
  const groups = [
    { key: "playing", title: "Currently playing" },
    { key: "backlog", title: "Backlog" },
    { key: "completed", title: "Completed" },
    { key: "on_hold", title: "On hold" },
    { key: "dropped", title: "Dropped" },
  ] as const;

  return (
    <Container>
      <PageHeader
        eyebrow="Video Games"
        title="Games I play"
        description="What I'm playing right now, what's waiting in the backlog, and where you can add me."
      />

      {games.length === 0 ? (
        <EmptyState
          title="No games yet"
          description="Add entries in src/data/games.ts."
        />
      ) : (
        <div className="space-y-12">
          {groups.map((group) => {
            const entries = games.filter((game) => game.status === group.key);
            if (entries.length === 0) return null;
            return (
              <Section
                key={group.key}
                title={group.title}
                count={entries.length}
              >
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ul>
              </Section>
            );
          })}
        </div>
      )}

      <Section
        id="uids"
        title="Game UIDs"
        count={gameUIDs.length}
        description="Player IDs so you can add me. Everything is copy-to-clipboard."
        className="mt-16 scroll-mt-24"
      >
        {gameUIDs.length === 0 ? (
          <EmptyState
            title="No UIDs shared"
            description="Add them in src/data/games.ts."
          />
        ) : (
          <UidTable entries={gameUIDs} />
        )}
      </Section>
    </Container>
  );
}
