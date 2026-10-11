import type { Discord, SocialLink } from "@/lib/types";
import { DiscordSchema, SocialLinkSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// TODO: Replace with your real social links.
// `platform` maps to an icon in `components/platform-icon.tsx` — supported
// values: github, x, twitter, linkedin, youtube, instagram, twitch, tiktok,
// reddit, bluesky, mastodon, discord, steam, spotify, anilist, myanimelist,
// letterboxd, website, email.
// ---------------------------------------------------------------------------

export const socials: SocialLink[] = SocialLinkSchema.array().parse([
  {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/yourhandle",
    handle: "@yourhandle",
  },
  {
    platform: "x",
    label: "X",
    url: "https://x.com/yourhandle",
    handle: "@yourhandle",
  },
  {
    platform: "youtube",
    label: "YouTube",
    url: "https://youtube.com/@yourhandle",
    handle: "@yourhandle",
  },
  {
    platform: "anilist",
    label: "AniList",
    url: "https://anilist.co/user/yourhandle",
    handle: "yourhandle",
  },
  {
    platform: "myanimelist",
    label: "MyAnimeList",
    url: "https://myanimelist.net/profile/yourhandle",
    handle: "yourhandle",
  },
  {
    platform: "steam",
    label: "Steam",
    url: "https://steamcommunity.com/id/yourhandle",
    handle: "yourhandle",
  },
  {
    platform: "spotify",
    label: "Spotify",
    url: "https://open.spotify.com/user/yourhandle",
    handle: "yourhandle",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/yourhandle",
    handle: "yourhandle",
  },
  {
    platform: "email",
    label: "Email",
    url: "mailto:you@example.com",
    handle: "you@example.com",
  },
]);

// ---------------------------------------------------------------------------
// Discord
//   userId        -> enables the "Send friend request" link
//                    (https://discord.com/users/<id>)
//   serverInviteUrl -> the "Join my server" button. MUST be a never-expiring
//                    invite (set Expire = Never in Discord, or use a vanity
//                    URL) or the button will silently break later.
// ---------------------------------------------------------------------------

const rawDiscord: Discord = {
  username: "yourdiscordusername",
  userId: "000000000000000000",
  serverName: "Your Server",
  serverInviteUrl: "https://discord.gg/your-invite",
};

export const discord: Discord = DiscordSchema.parse(rawDiscord);
