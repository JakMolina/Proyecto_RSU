export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession, SESSION_COOKIE } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET() {
  const session = await getSession();
  return noStore(NextResponse.json({ authed: !!session, email: session?.email ?? null }));
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return noStore(res);
}
