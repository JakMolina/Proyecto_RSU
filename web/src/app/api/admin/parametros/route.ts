export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request) {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  const updates = Object.entries(body) as [string, string][];
  const sb = supabaseService();
  for (const [clave, valor] of updates) {
    const { error } = await sb.from("parametros").update({ valor, actualizado: new Date().toISOString() }).eq("clave", clave);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
