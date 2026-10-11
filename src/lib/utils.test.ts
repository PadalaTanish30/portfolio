import { describe, expect, it } from "vitest";
import {
  cn,
  formatDate,
  formatProgress,
  formatScore,
  isAllowedUrl,
  percent,
  relativeTime,
  safeHref,
  truncate,
} from "@/lib/utils";

describe("safeHref", () => {
  it("accepts http(s), mailto and site-relative URLs", () => {
    expect(safeHref("https://example.com/a")).toBe("https://example.com/a");
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("HTTPS://EXAMPLE.COM")).toBe("HTTPS://EXAMPLE.COM");
    expect(safeHref("/anime")).toBe("/anime");
    expect(safeHref("mailto:me@example.com")).toBe("mailto:me@example.com");
  });

  it("rejects dangerous or unsupported schemes", () => {
    expect(safeHref("javascript:alert(1)")).toBeUndefined();
    expect(safeHref("JavaScript:alert(1)")).toBeUndefined();
    expect(
      safeHref("data:text/html,<script>alert(1)</script>"),
    ).toBeUndefined();
    expect(safeHref("vbscript:msgbox(1)")).toBeUndefined();
    expect(safeHref("ftp://example.com/file")).toBeUndefined();
    // Protocol-relative URLs are rejected (they can silently switch origin).
    expect(safeHref("//evil.example.com")).toBeUndefined();
  });

  it("handles empty and missing values", () => {
    expect(safeHref()).toBeUndefined();
    expect(safeHref("")).toBeUndefined();
    expect(safeHref("   ")).toBeUndefined();
  });

  it("trims surrounding whitespace", () => {
    expect(safeHref("  https://example.com  ")).toBe("https://example.com");
    expect(safeHref("\thttps://example.com\n")).toBe("https://example.com");
  });

  it("accepts the site root and a bare mailto: prefix", () => {
    expect(safeHref("/")).toBe("/");
    expect(safeHref("mailto:")).toBe("mailto:");
  });

  it("matches the scheme case-insensitively", () => {
    expect(safeHref("MailTo:me@example.com")).toBe("MailTo:me@example.com");
  });
});

describe("truncate", () => {
  it("strips HTML tags and collapses whitespace", () => {
    expect(truncate("<p>Hello   <b>world</b></p>")).toBe("Hello world");
  });

  it("truncates with an ellipsis and never exceeds max", () => {
    const result = truncate("a".repeat(50), 10);
    expect(result.length).toBeLessThanOrEqual(10);
    expect(result.endsWith("…")).toBe(true);
  });

  it("returns short input unchanged", () => {
    expect(truncate("short", 10)).toBe("short");
  });
});

describe("formatScore", () => {
  it("normalises a 0–100 score to a 0–10 string", () => {
    expect(formatScore(85)).toBe("8.5");
    expect(formatScore(0)).toBe("0.0");
    expect(formatScore(100)).toBe("10.0");
  });

  it("honours the digits argument", () => {
    expect(formatScore(123, 2)).toBe("12.30");
  });

  it("returns null for missing or invalid scores", () => {
    expect(formatScore(undefined)).toBeNull();
    expect(formatScore(Number.NaN)).toBeNull();
  });
});

describe("formatProgress", () => {
  it("formats progress against a total", () => {
    expect(formatProgress(12, 24)).toBe("12 / 24");
  });

  it("formats progress without a total", () => {
    expect(formatProgress(12)).toBe("12");
    expect(formatProgress(0, 0)).toBe("0");
  });

  it("defaults missing progress to zero when a total exists", () => {
    expect(formatProgress(undefined, 24)).toBe("0 / 24");
  });

  it("returns null when nothing is known", () => {
    expect(formatProgress()).toBeNull();
  });
});

describe("percent", () => {
  it("computes a clamped percentage", () => {
    expect(percent(5, 10)).toBe(50);
    expect(percent(20, 10)).toBe(100);
    expect(percent(-5, 10)).toBe(0);
  });

  it("returns 0 for unknown totals", () => {
    expect(percent(5, 0)).toBe(0);
    expect(percent(5)).toBe(0);
    expect(percent(undefined, 10)).toBe(0);
  });
});

describe("formatDate", () => {
  it("formats a valid date (en-GB)", () => {
    expect(formatDate(new Date(2026, 2, 12))).toBe("12 Mar 2026");
  });

  it("returns an empty string for invalid input", () => {
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("relativeTime", () => {
  it("describes the past", () => {
    const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
    expect(relativeTime(threeDaysAgo)).toBe("3 days ago");
  });

  it("describes the future", () => {
    const inTwoDays = Date.now() + 2 * 24 * 60 * 60 * 1000;
    expect(relativeTime(inTwoDays)).toBe("in 2 days");
  });

  it("returns an empty string for invalid input", () => {
    expect(relativeTime("nope")).toBe("");
  });
});

describe("cn", () => {
  it("joins truthy classes and drops falsy ones", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("resolves Tailwind conflicts, last wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("isAllowedUrl", () => {
  it("accepts http(s) and site-relative URLs by default", () => {
    expect(isAllowedUrl("https://example.com")).toBe(true);
    expect(isAllowedUrl("http://example.com")).toBe(true);
    expect(isAllowedUrl("/anime")).toBe(true);
  });

  it("allows mailto by default but rejects it when allowMailto is false", () => {
    expect(isAllowedUrl("mailto:me@example.com")).toBe(true);
    expect(isAllowedUrl("mailto:me@example.com", { allowMailto: false })).toBe(
      false,
    );
    expect(isAllowedUrl("https://example.com", { allowMailto: false })).toBe(
      true,
    );
    expect(isAllowedUrl("/anime", { allowMailto: false })).toBe(true);
  });

  it("rejects dangerous schemes, protocol-relative and empty values", () => {
    expect(isAllowedUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedUrl("data:text/html,x")).toBe(false);
    expect(isAllowedUrl("//evil.example.com")).toBe(false);
    expect(isAllowedUrl("")).toBe(false);
  });
});
