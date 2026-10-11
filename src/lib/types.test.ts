import { describe, expect, it } from "vitest";
import { MediaEntrySchema, SocialLinkSchema } from "@/lib/types";

const social = (url: string) =>
  SocialLinkSchema.safeParse({ platform: "x", label: "X", url }).success;

const media = (fields: { coverImage?: string; link?: string }) =>
  MediaEntrySchema.safeParse({
    id: 1,
    title: "Title",
    status: "watching",
    ...fields,
  }).success;

describe("safeUrl (via SocialLinkSchema)", () => {
  it("accepts http(s), mailto and site-relative URLs", () => {
    expect(social("https://example.com")).toBe(true);
    expect(social("http://example.com")).toBe(true);
    expect(social("mailto:me@example.com")).toBe(true);
    expect(social("/connect")).toBe(true);
  });

  it("rejects dangerous schemes and protocol-relative URLs", () => {
    expect(social("javascript:alert(1)")).toBe(false);
    expect(social("data:text/html,x")).toBe(false);
    expect(social("ftp://example.com")).toBe(false);
    expect(social("//evil.example.com")).toBe(false);
  });

  it("does not trim (unlike safeHref), so padded or empty values fail", () => {
    expect(social("  https://example.com  ")).toBe(false);
    expect(social("")).toBe(false);
  });
});

describe("imageUrl vs link (via MediaEntrySchema)", () => {
  it("accepts an http(s) or site-relative cover image", () => {
    expect(media({ coverImage: "https://img.example.com/x.jpg" })).toBe(true);
    expect(media({ coverImage: "/local.png" })).toBe(true);
  });

  it("rejects a mailto cover image", () => {
    expect(media({ coverImage: "mailto:x@y.com" })).toBe(false);
  });

  it("rejects a protocol-relative cover image", () => {
    expect(media({ coverImage: "//evil.example.com/x.jpg" })).toBe(false);
  });

  it("accepts a mailto link even though images forbid it", () => {
    expect(media({ link: "mailto:x@y.com" })).toBe(true);
  });

  it("accepts an entry with neither coverImage nor link", () => {
    expect(media({})).toBe(true);
  });
});
