import { NextRequest } from "next/server";
import prisma from "@/packages/lib/prisma";
import { hashPassword, signToken } from "@/packages/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, password: hashed, name: name || null },
  });

  const token = signToken({ id: user.id, email: user.email!, name: user.name });

  const res = Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  res.headers.set(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  );
  return res;
}
