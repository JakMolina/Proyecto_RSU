export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseAnon, supabaseService, supabaseConfigurado } from "@/lib/supabase";
import { SESSION_COOKIE } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function POST(req: Request) {
  if (!supabaseConfigurado()) {
    return noStore(NextResponse.json(
      { error: "Supabase no configurado. Revisa .env.local." },
      { status: 500 }
    ));
  }
  const { email, password } = await req.json().catch(() => ({} as any));
  if (!email || !password) return noStore(NextResponse.json({ error: "faltan credenciales" }, { status: 422 }));

  // Supabase Auth valida la contraseña con el cliente anónimo (no con service role)
  const { data: authed, error } = await supabaseAnon().auth.signInWithPassword({ email, password });
  if (error || !authed.session) return noStore(NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 }));

  const uid = authed.user!.id;
  const { data: admin } = await supabaseService().from("admins").select("email").eq("id", uid).maybeSingle();
  if (!admin) return noStore(NextResponse.json({ error: "Sin permisos de administrador" }, { status: 403 }));

  const res = NextResponse.json({ ok: true, email: admin.email });
  res.cookies.set(SESSION_COOKIE, authed.session.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return noStore(res);
}
