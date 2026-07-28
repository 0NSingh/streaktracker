import { NextRequest } from "next/server";
import prisma from "@/packages/lib/prisma";
import { verifyPassword, signToken } from "@/packages/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return Response.json({ error: "Email and password required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: user.id, email: user.email!, name: user.name });

  const res = Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  res.headers.set(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  );
  return res;
}
