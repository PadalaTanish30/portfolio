import type { Discord, SocialLink } from "@/lib/types";
import { DiscordSchema, SocialLinkSchema } from "@/lib/types";

// ---------------------------------------------------------------------------
// Social links. `platform` maps to an icon in `components/platform-icon.tsx` —
// supported values: github, x, twitter, linkedin, youtube, instagram, twitch,
// tiktok, reddit, bluesky, mastodon, discord, steam, spotify, anilist,
// myanimelist, letterboxd, website, email.
// ---------------------------------------------------------------------------

export const socials: SocialLink[] = SocialLinkSchema.array().parse([
  {
    platform: "github",
    label: "GitHub",
    url: "https://github.com/PadalaTanish30",
    handle: "@PadalaTanish30",
  },
  {
    platform: "x",
    label: "X",
    url: "https://x.com/hey_tanish",
    handle: "@hey_tanish",
  },
  {
    platform: "youtube",
    label: "YouTube",
    url: "https://www.youtube.com/@heytanish",
    handle: "@heytanish",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/tanish-padala",
    handle: "tanish-padala",
  },
  {
    platform: "anilist",
    label: "AniList",
    url: "https://anilist.co/user/TanZer0",
    handle: "TanZer0",
  },
  {
    platform: "steam",
    label: "Steam",
    url: "https://steamcommunity.com/id/TanZer0",
    handle: "TanZer0",
  },
  {
    platform: "email",
    label: "Email",
    url: "mailto:padalatanish30@gmail.com",
    handle: "padalatanish30@gmail.com",
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
