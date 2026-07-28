import "server-only";

import prisma from "@/packages/lib/prisma";
import type { EntryWithDate } from "@/packages/lib/streak-utils";

export async function getEntriesForGoal(
  goalSlug: string
): Promise<EntryWithDate[]> {
  const entries = await prisma.entry.findMany({
    where: { goal: { slug: goalSlug } },
    select: { date: true, weight: true },
    orderBy: { date: "desc" },
  });
  return entries;
}
