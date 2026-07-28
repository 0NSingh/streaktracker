import { describe, it, expect } from "vitest";
import { generateSlug } from "@/packages/lib/slug";

describe("generateSlug", () => {
  it("generates a slug from a title", () => {
    const slug = generateSlug("System Design");
    expect(slug).toMatch(/^system-design-[a-z0-9]+$/);
  });

  it("handles special characters", () => {
    const slug = generateSlug("Hello World! How are you?");
    expect(slug).toMatch(/^hello-world-how-are-you-[a-z0-9]+$/);
  });

  it("truncates long titles", () => {
    const long = "a".repeat(100);
    const slug = generateSlug(long);
    expect(slug.length).toBeLessThan(60);
  });

  it("always generates unique slugs", () => {
    const slugs = new Set<string>();
    for (let i = 0; i < 50; i++) {
      slugs.add(generateSlug("Same Title"));
    }
    expect(slugs.size).toBe(50);
  });
});
