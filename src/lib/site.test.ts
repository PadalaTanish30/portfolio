import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `siteConfig.url` is computed once at module load, so each test has to reset
 * the module registry and re-import it to observe the current environment.
 */
async function resolveUrl(): Promise<string> {
  vi.resetModules();
  const { siteConfig } = await import("@/lib/site");
  return siteConfig.url;
}

function blankEnv() {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
  vi.stubEnv("VERCEL_URL", "");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("siteConfig.url", () => {
  it("uses an explicit NEXT_PUBLIC_SITE_URL, stripping a trailing slash", async () => {
    blankEnv();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://custom.example/");
    await expect(resolveUrl()).resolves.toBe("https://custom.example");
  });

  it("ignores a whitespace-only override and falls through", async () => {
    blankEnv();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "   ");
    vi.stubEnv(
      "VERCEL_PROJECT_PRODUCTION_URL",
      "portfolio-virid-phi-98.vercel.app",
    );
    await expect(resolveUrl()).resolves.toBe(
      "https://portfolio-virid-phi-98.vercel.app",
    );
  });

  it("falls back to Vercel's production domain", async () => {
    blankEnv();
    vi.stubEnv(
      "VERCEL_PROJECT_PRODUCTION_URL",
      "portfolio-virid-phi-98.vercel.app",
    );
    await expect(resolveUrl()).resolves.toBe(
      "https://portfolio-virid-phi-98.vercel.app",
    );
  });

  it("falls back to the per-deployment URL when only VERCEL_URL is set", async () => {
    blankEnv();
    // An empty VERCEL_PROJECT_PRODUCTION_URL must not shadow VERCEL_URL.
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    vi.stubEnv("VERCEL_URL", "portfolio-abc123.vercel.app");
    await expect(resolveUrl()).resolves.toBe(
      "https://portfolio-abc123.vercel.app",
    );
  });

  it("tolerates a value that already carries a scheme and trailing slash", async () => {
    blankEnv();
    vi.stubEnv(
      "VERCEL_PROJECT_PRODUCTION_URL",
      "https://portfolio.vercel.app/",
    );
    await expect(resolveUrl()).resolves.toBe("https://portfolio.vercel.app");
  });

  it("keeps the placeholder when nothing is configured", async () => {
    blankEnv();
    await expect(resolveUrl()).resolves.toBe(
      "https://your-portfolio.vercel.app",
    );
  });
});
