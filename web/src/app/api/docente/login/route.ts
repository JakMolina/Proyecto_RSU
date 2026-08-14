export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService, supabaseConfigurado } from "@/lib/supabase";
import { DOCENTE_COOKIE } from "@/lib/auth";

/** Login de docente: valida que el DNI exista en participantes y setea cookie. */
export async function POST(req: Request) {
  if (!supabaseConfigurado()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }
  const { dni } = await req.json().catch(() => ({} as any));
  const dniLimpio = String(dni ?? "").trim();
  if (!/^\d{8}$/.test(dniLimpio)) {
    return NextResponse.json({ error: "DNI inválido (8 dígitos)." }, { status: 422 });
  }
  const sb = supabaseService();
  const { data: part, error } = await sb
    .from("participantes")
    .select("id, dni, nombre_completo")
    .eq("dni", dniLimpio)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!part) return NextResponse.json({ error: "Este DNI no está registrado. Regístrate primero." }, { status: 404 });

  const res = NextResponse.json({ ok: true, nombre: part.nombre_completo });
  // Cookie firmada/serializada simple: "dni" en formato json. httpOnly para no exponer.
  res.cookies.set(DOCENTE_COOKIE, JSON.stringify({ id: part.id, dni: part.dni, nombre: part.nombre_completo }), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 días
  });
  return res;
}

/** Logout docente. */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DOCENTE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
