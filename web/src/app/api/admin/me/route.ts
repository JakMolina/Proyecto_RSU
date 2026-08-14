export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ authed: !!session, email: session?.email ?? null });
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
