import { describe, it, expect } from "vitest";

function computeStreak(dates: Date[]) {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0, totalEntries: 0 };
  const ms = dates.map((d) => {
    const c = new Date(d);
    c.setHours(0, 0, 0, 0);
    return c.getTime();
  });
  const uniq = [...new Set(ms)].sort((a, b) => b - a);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const t = today.getTime();
  const y = t - 86_400_000;

  let cur = 0;
  if (uniq[0] === t || uniq[0] === y) {
    cur = 1;
    for (let i = 1; i < uniq.length; i++) {
      if (uniq[i - 1] - uniq[i] === 86_400_000) cur++;
      else break;
    }
  }

  let longest = 0, streak = 1;
  for (let i = 1; i < uniq.length; i++) {
    if (uniq[i - 1] - uniq[i] === 86_400_000) streak++;
    else { longest = Math.max(longest, streak); streak = 1; }
  }
  longest = Math.max(longest, streak);
  if (uniq.length === 1) longest = 1;

  return { currentStreak: cur, longestStreak: longest, totalEntries: uniq.length };
}

describe("computeStreak", () => {
  const day = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  it("returns zeros for empty entries", () => {
    expect(computeStreak([])).toEqual({ currentStreak: 0, longestStreak: 0, totalEntries: 0 });
  });

  it("counts a single entry today", () => {
    const r = computeStreak([day(0)]);
    expect(r.currentStreak).toBe(1);
    expect(r.longestStreak).toBe(1);
    expect(r.totalEntries).toBe(1);
  });

  it("counts consecutive days", () => {
    const dates = [day(0), day(-1), day(-2)];
    const r = computeStreak(dates);
    expect(r.currentStreak).toBe(3);
    expect(r.longestStreak).toBe(3);
    expect(r.totalEntries).toBe(3);
  });

  it("stops streak on gap", () => {
    const dates = [day(0), day(-1), day(-3)];
    const r = computeStreak(dates);
    expect(r.currentStreak).toBe(2);
    expect(r.longestStreak).toBe(2);
  });

  it("tracks longest streak separately", () => {
    const dates = [day(0), day(-2), day(-3), day(-4)];
    const r = computeStreak(dates);
    expect(r.currentStreak).toBe(1);
    expect(r.longestStreak).toBe(3);
  });

  it("handles yesterday as active", () => {
    const dates = [day(-1), day(-2), day(-3)];
    const r = computeStreak(dates);
    expect(r.currentStreak).toBe(3);
  });

  it("deduplicates same-date entries", () => {
    const dates = [day(0), day(0), day(-1), day(-2)];
    const r = computeStreak(dates);
    expect(r.currentStreak).toBe(3);
    expect(r.totalEntries).toBe(3);
  });
});

describe("generateHeatmapData", () => {
  function todayKey(): string {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  }

  function generateHeatmapData(
    entries: { date: Date; weight: number }[],
    weeks: number = 26
  ) {
    const map = new Map<string, number>();
    for (const e of entries) {
      const key = e.date.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + e.weight);
    }
    const result: { date: string; level: number }[] = [];
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - weeks * 7 + 1);
    start.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const totalWeight = map.get(key) || 0;
      let level = 0;
      if (totalWeight > 0) {
        level = totalWeight >= 4 ? 4 : totalWeight >= 3 ? 3 : totalWeight >= 2 ? 2 : 1;
      }
      result.push({ date: key, level });
    }
    return result;
  }

  it("returns correct number of days", () => {
    const data = generateHeatmapData([], 4);
    expect(data.length).toBe(28);
  });

  it("assigns correct level based on weight", () => {
    const key = todayKey();
    const entries = [
      { date: new Date(key), weight: 1 },
    ];
    const data = generateHeatmapData(entries, 1);
    const todayEntry = data.find((d) => d.date === key);
    expect(todayEntry?.level).toBe(1);
  });

  it("assigns level 4 for weight >= 4", () => {
    const key = todayKey();
    const entries = [{ date: new Date(key), weight: 5 }];
    const data = generateHeatmapData(entries, 1);
    const entry = data.find((d) => d.date === key);
    expect(entry?.level).toBe(4);
  });
});
