import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Zero-cost posture: Vercel's Hobby tier allows ~5,000 image
     * transformations/month, billed on cache miss *and* staleness. Every
     * cover host we use (AniList, MAL, Steam, Spotify) already serves
     * appropriately sized images, so we bypass the optimizer entirely.
     *
     * Side benefit: with the optimizer bypassed, an off-allowlist host can no
     * longer throw `Invalid src prop` and break a page.
     *
     * To re-enable optimization later, set `unoptimized: false` and keep the
     * `remotePatterns` allow-list below (narrow each to a `pathname` if you do).
     */
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co", pathname: "/**" },
      { protocol: "https", hostname: "cdn.myanimelist.net", pathname: "/**" },
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      { protocol: "https", hostname: "images.igdb.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
