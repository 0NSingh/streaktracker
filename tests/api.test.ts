import { describe, it, expect } from "vitest";
import { computeClientStreak } from "@/packages/lib/streak-utils";

describe("computeClientStreak", () => {
  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  it("returns zeros for empty dates", () => {
    expect(computeClientStreak([])).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it("counts a single entry today", () => {
    expect(computeClientStreak([day(0)])).toEqual({ currentStreak: 1, longestStreak: 1 });
  });

  it("counts consecutive days", () => {
    expect(computeClientStreak([day(0), day(-1), day(-2)])).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("stops streak on gap", () => {
    expect(computeClientStreak([day(0), day(-1), day(-3)])).toEqual({ currentStreak: 2, longestStreak: 2 });
  });

  it("tracks longest streak separately", () => {
    expect(computeClientStreak([day(0), day(-2), day(-3), day(-4)])).toEqual({ currentStreak: 1, longestStreak: 3 });
  });

  it("handles yesterday as active", () => {
    expect(computeClientStreak([day(-1), day(-2), day(-3)])).toEqual({ currentStreak: 3, longestStreak: 3 });
  });

  it("deduplicates same-date entries", () => {
    expect(computeClientStreak([day(0), day(0), day(-1), day(-2)])).toEqual({ currentStreak: 3, longestStreak: 3 });
  });
});

describe("Public shareable view contract", () => {
  const slug = "test-goal-abc123";

  it("public goal API returns goal by slug without auth", async () => {
    const res = await fetch(`http://localhost:3000/api/goals/${slug}`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.goal).toBeDefined();
    expect(data.goal.slug).toBe(slug);
    expect(data.goal.title).toBeDefined();
    expect(data.goal.user).toBeDefined();
  });

  it("public entries API returns entries without auth", async () => {
    const res = await fetch(`http://localhost:3000/api/goals/${slug}/entries`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.entries).toBeDefined();
    expect(Array.isArray(data.entries)).toBe(true);
  });

  it("non-owner cannot POST entries", async () => {
    const res = await fetch(`http://localhost:3000/api/goals/${slug}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: new Date().toISOString() }),
    });
    expect(res.status).toBe(401);
  });

  it("non-owner cannot PUT entries", async () => {
    const res = await fetch(`http://localhost:3000/api/goals/${slug}/entries/fake-id`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: "hacked" }),
    });
    expect(res.status).toBe(401);
  });

  it("non-owner cannot DELETE entries", async () => {
    const res = await fetch(`http://localhost:3000/api/goals/${slug}/entries/fake-id`, {
      method: "DELETE",
    });
    expect(res.status).toBe(401);
  });

  it("unauthenticated POST /api/goals returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "My Goal" }),
    });
    expect(res.status).toBe(401);
  });

  it("unauthenticated GET /api/goals returns 401", async () => {
    const res = await fetch("http://localhost:3000/api/goals");
    expect(res.status).toBe(401);
  });

  it("public goal API returns 404 for nonexistent slug", async () => {
    const res = await fetch("http://localhost:3000/api/goals/nonexistent-slug");
    expect(res.status).toBe(404);
  });
});
