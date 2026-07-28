import { NextRequest } from "next/server";
import prisma from "@/packages/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const goal = await prisma.goal.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true } },
      _count: { select: { entries: true } },
    },
  });

  if (!goal) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }

  return Response.json({ goal });
}
