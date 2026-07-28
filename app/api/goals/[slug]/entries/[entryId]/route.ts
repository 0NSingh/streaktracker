import { NextRequest } from "next/server";
import prisma from "@/packages/lib/prisma";
import { getSession } from "@/packages/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; entryId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, entryId } = await params;
  const goal = await prisma.goal.findUnique({ where: { slug } });
  if (!goal) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }
  if (goal.userId !== session.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!existing || existing.goalId !== goal.id) {
    return Response.json({ error: "Entry not found" }, { status: 404 });
  }

  const { note, weight, date } = await req.json();

  const edits: Record<string, string | number | null>[] = [];
  if (note !== undefined && note !== existing.note) {
    edits.push({ previousNote: existing.note, newNote: note });
  }
  if (weight !== undefined && weight !== existing.weight) {
    edits.push({ previousWeight: existing.weight, newWeight: weight });
  }
  if (date !== undefined) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    const oldDate = existing.date;
    if (newDate.getTime() !== oldDate.getTime()) {
      edits.push({});
    }
  }

  const updateData: Record<string, unknown> = {};
  if (note !== undefined) updateData.note = note;
  if (weight !== undefined) updateData.weight = weight;
  if (date !== undefined) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    updateData.date = d;
  }

  if (edits.length > 0) {
    updateData.edits = {
      create: edits.map((e) => ({
        previousNote: e.previousNote as string | null ?? null,
        previousWeight: e.previousWeight as number | null ?? null,
        newNote: e.newNote as string | null ?? null,
        newWeight: e.newWeight as number | null ?? null,
      })),
    };
  }

  const entry = await prisma.entry.update({
    where: { id: entryId },
    data: updateData,
    include: { edits: { orderBy: { createdAt: "desc" } } },
  });

  return Response.json({ entry });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string; entryId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, entryId } = await params;
  const goal = await prisma.goal.findUnique({ where: { slug } });
  if (!goal) {
    return Response.json({ error: "Goal not found" }, { status: 404 });
  }
  if (goal.userId !== session.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.entry.findUnique({ where: { id: entryId } });
  if (!existing || existing.goalId !== goal.id) {
    return Response.json({ error: "Entry not found" }, { status: 404 });
  }

  await prisma.entry.delete({ where: { id: entryId } });
  return Response.json({ ok: true });
}
