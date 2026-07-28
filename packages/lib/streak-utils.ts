export type EntryWithDate = {
  date: Date;
  weight: number;
};

export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
};

export function computeStreak(entries: EntryWithDate[]): StreakInfo {
  const dates = entries.map((e) => e.date);
  const { currentStreak, longestStreak } = computeClientStreak(dates);
  const uniqueDates = [...new Set(dates.map((d) => {
    const c = new Date(d); c.setHours(0, 0, 0, 0);
    return c.getTime();
  }))];
  return { currentStreak, longestStreak, totalEntries: uniqueDates.length };
}

export function computeClientStreak(dates: Date[]) {
  if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };
  const uniq = [...new Set(dates.map((d) => {
    const c = new Date(d); c.setHours(0, 0, 0, 0);
    return c.getTime();
  }))].sort((a, b) => b - a);
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

  return { currentStreak: cur, longestStreak: longest };
}

export function generateHeatmapData(
  entries: EntryWithDate[],
  weeks: number = 26
): { date: string; level: number }[] {
  const map = new Map<string, number>();
  for (const e of entries) {
    const key = new Date(e.date).toISOString().slice(0, 10);
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
