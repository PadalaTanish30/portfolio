import { ExternalLink } from "lucide-react";
import type { GameUID } from "@/lib/types";
import { CopyButton } from "@/components/copy-button";

export function UidTable({ entries }: { entries: GameUID[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        <caption className="sr-only">Game account IDs for adding me</caption>
        <thead>
          <tr className="border-b border-border bg-surface-muted text-left text-xs uppercase tracking-wide text-muted">
            <th scope="col" className="px-4 py-3 font-semibold">
              Game
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              ID / UID
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Region
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Platform
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Copy
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.game}-${entry.uid}`}
              className="border-b border-border last:border-0"
            >
              <td className="px-4 py-3 font-medium">
                <span className="flex flex-col">
                  <span>{entry.game}</span>
                  {entry.note ? (
                    <span className="text-xs text-muted">{entry.note}</span>
                  ) : null}
                </span>
              </td>
              <td className="px-4 py-3">
                <code className="rounded bg-surface-muted px-2 py-1 font-mono text-xs">
                  {entry.uid}
                </code>
              </td>
              <td className="px-4 py-3 text-muted">{entry.region}</td>
              <td className="px-4 py-3 text-muted">{entry.platform}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {entry.link ? (
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-2.5 text-xs font-medium hover:bg-surface-muted"
                    >
                      Open
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  ) : null}
                  <CopyButton
                    value={entry.uid}
                    label="Copy"
                    ariaLabel={`Copy ${entry.game} ID`}
                    copiedLabel="Copied!"
                    size="sm"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
