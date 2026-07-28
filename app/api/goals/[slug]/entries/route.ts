import { NextRequest } from "next/server";
import prisma from "@/packages/lib/prisma";
import { getSession } from "@/packages/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const goal = await prisma.goal.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const where: Record<string, unknown> = { goalId: goal.id };
    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    const entries = await prisma.entry.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        edits: { orderBy: { createdAt: "desc" } },
      },
    });

    return Response.json({ entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const goal = await prisma.goal.findUnique({ where: { slug } });
  if (!goal) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }
  if (goal.userId !== session.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { date, note, weight } = await req.json();
  if (!date) {
    return Response.json({ error: "Date required" }, { status: 400 });
  }

  const entryDate = new Date(date);
  entryDate.setHours(0, 0, 0, 0);

  const entry = await prisma.entry.create({
    data: {
      goalId: goal.id,
      date: entryDate,
      note: note ?? null,
      weight: weight ?? 1,
    },
  });

  return Response.json({ entry }, { status: 201 });
}
