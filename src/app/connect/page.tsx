import type { Metadata } from "next";
import { MessageCircle, UserPlus, Users } from "lucide-react";
import { discord, socials } from "@/data/socials";
import { Container } from "@/components/container";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/card";
import { ButtonLink } from "@/components/button-link";
import { CopyButton } from "@/components/copy-button";
import { PlatformIcon } from "@/components/platform-icon";

export const metadata: Metadata = {
  title: "Connect",
  description: "All the places you can find and add me — including Discord.",
};

export default function ConnectPage() {
  const friendUrl = discord.userId
    ? `https://discord.com/users/${discord.userId}`
    : undefined;

  return (
    <Container size="narrow">
      <PageHeader
        title="Find me online"
        description="Add me on Discord or find me on any of the platforms below. The quickest way to reach me is Discord."
      />

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
          Discord
        </h2>
        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">Username</p>
              <p className="font-mono text-lg font-semibold">
                {discord.username}
              </p>
            </div>
            <CopyButton value={discord.username} label="Copy username" />
          </div>

          <div className="flex flex-wrap gap-2">
            {friendUrl ? (
              <ButtonLink href={friendUrl} external>
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Send friend request
              </ButtonLink>
            ) : null}
            {discord.serverInviteUrl ? (
              <ButtonLink
                href={discord.serverInviteUrl}
                external
                variant="secondary"
              >
                <Users className="h-4 w-4" aria-hidden="true" />
                {discord.serverName
                  ? `Join ${discord.serverName}`
                  : "Join my server"}
              </ButtonLink>
            ) : null}
            {!friendUrl && !discord.serverInviteUrl ? (
              <p className="text-sm text-muted">
                Set <code className="font-mono">userId</code> and{" "}
                <code className="font-mono">serverInviteUrl</code> in{" "}
                <code className="font-mono">src/data/socials.ts</code> to enable
                these buttons.
              </p>
            ) : null}
          </div>

          {discord.serverInviteUrl ? (
            <p className="text-xs text-muted">
              Heads up: use a <strong>never-expiring</strong> invite for the
              server button, otherwise the link will eventually stop working.
            </p>
          ) : null}
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
          Socials
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {socials.map((social) => {
            const isExternal = !social.url.startsWith("mailto:");
            const inner = (
              <>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-sm bg-surface-muted text-primary">
                  <PlatformIcon
                    platform={social.platform}
                    className="h-4 w-4"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {social.label}
                  </span>
                  {social.handle ? (
                    <span className="block truncate text-xs text-muted">
                      {social.handle}
                    </span>
                  ) : null}
                </span>
              </>
            );

            return (
              <li key={social.platform}>
                {isExternal ? (
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 shadow-[var(--shadow-card)] transition-[background-color,border-color,box-shadow] hover:border-primary hover:bg-surface-muted"
                  >
                    {inner}
                  </a>
                ) : (
                  <a
                    href={social.url}
                    className="flex items-center gap-3 rounded-md border border-border bg-surface p-3 shadow-[var(--shadow-card)] transition-[background-color,border-color,box-shadow] hover:border-primary hover:bg-surface-muted"
                  >
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}
