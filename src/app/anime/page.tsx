import type { Metadata } from "next";
import { getAnimeList } from "@/lib/anilist";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";
import { MediaExplorer } from "@/components/media-explorer";

// Must be a literal — Next route segment config is statically analysed.
export const revalidate = 21600; // 6 hours

export const metadata: Metadata = {
  title: "Anime",
  description: "Everything I'm watching, have watched, and plan to watch.",
};

export default async function AnimePage() {
  const { entries, source } = await getAnimeList();

  const watching = entries.filter(
    (entry) => entry.status === "watching",
  ).length;
  const completed = entries.filter(
    (entry) => entry.status === "completed",
  ).length;
  const planned = entries.filter((entry) => entry.status === "plan").length;

  return (
    <Container>
      <PageHeader
        title="Anime I watch"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {entries.length} titles total — {watching} watching, {completed}{" "}
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
          { value: "watching", label: "Watching" },
          { value: "completed", label: "Completed" },
          { value: "plan", label: "Plan to Watch" },
          { value: "on_hold", label: "On Hold" },
          { value: "dropped", label: "Dropped" },
        ]}
      />
    </Container>
  );
}
