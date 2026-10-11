import type { Metadata } from "next";
import { getMangaList } from "@/lib/anilist";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";
import { MediaExplorer } from "@/components/media-explorer";

// Must be a literal — Next route segment config is statically analysed.
export const revalidate = 21600; // 6 hours

export const metadata: Metadata = {
  title: "Manga",
  description: "Everything I'm reading, have read, and plan to read.",
};

export default async function MangaPage() {
  const { entries, source } = await getMangaList();

  const reading = entries.filter((entry) => entry.status === "reading").length;
  const completed = entries.filter(
    (entry) => entry.status === "completed",
  ).length;
  const planned = entries.filter((entry) => entry.status === "plan").length;

  return (
    <Container>
      <PageHeader
        eyebrow="Manga"
        title="Manga I read"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {entries.length} titles total — {reading} reading, {completed}{" "}
              completed, {planned} planned.
            </span>
            <Badge variant={source === "fallback" ? "warning" : "success"}>
              {source === "anilist" && "Synced from AniList"}
              {source === "jikan" && "Synced from MyAnimeList"}
              {source === "fallback" && "Local data"}
            </Badge>
          </span>
        }
      />

      <MediaExplorer
        entries={entries}
        statusFilters={[
          { value: "reading", label: "Reading" },
          { value: "completed", label: "Completed" },
          { value: "plan", label: "Plan to Read" },
          { value: "on_hold", label: "On Hold" },
          { value: "dropped", label: "Dropped" },
        ]}
      />
    </Container>
  );
}
