import { NextRequest } from "next/server";
import prisma from "@/packages/lib/prisma";
import { getSession } from "@/packages/lib/auth";
import { generateSlug } from "@/packages/lib/slug";
import { computeClientStreak } from "@/packages/lib/streak-utils";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title } = await req.json();
  if (!title || typeof title !== "string") {
    return Response.json({ error: "Title required" }, { status: 400 });
  }

  const slug = generateSlug(title);
  const goal = await prisma.goal.create({
    data: { title, slug, userId: session.id },
  });

  return Response.json({ goal }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await prisma.goal.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { entries: true } },
      entries: { select: { date: true }, orderBy: { date: "desc" } },
    },
  });

  const goalsWithMeta = goals.map((g) => {
    const dates = g.entries.map((e) => e.date);
    const { currentStreak, longestStreak } = computeClientStreak(dates);
    return {
      id: g.id,
      title: g.title,
      slug: g.slug,
      createdAt: g.createdAt,
      _count: g._count,
      currentStreak,
      longestStreak,
    };
  });

  return Response.json({ goals: goalsWithMeta });
}
