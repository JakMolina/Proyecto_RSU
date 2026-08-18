export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

/** Lista sesiones con conteo de talleres. Solo admin. */
export async function GET() {
  if (!await getSession()) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const sb = supabaseService();

  const { data: sesiones, error } = await sb
    .from("sesiones")
    .select("id, nombre, fecha, hora_inicio, hora_fin, creada_en")
    .order("fecha", { ascending: true })
    .order("hora_inicio", { ascending: true });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));

  const { data: talleres } = await sb.from("talleres").select("session_id");
  const counts = new Map<string, number>();
  (talleres ?? []).forEach((t: any) => {
    if (t.session_id) counts.set(t.session_id, (counts.get(t.session_id) ?? 0) + 1);
  });

  const out = (sesiones ?? []).map((s: any) => ({
    ...s,
    talleres: counts.get(s.id) ?? 0,
  }));
  return noStore(NextResponse.json({ sesiones: out }));
}

/** Crea una sesión (entidad de primer nivel). Solo admin.
 *  Body: { nombre, fecha, hora_inicio, hora_fin } */
export async function POST(req: Request) {
  if (!await getSession()) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const body = await req.json().catch(() => null);
  if (!body) return noStore(NextResponse.json({ error: "JSON inválido" }, { status: 400 }));

  const nombre = String(body.nombre ?? "").trim();
  const fecha = String(body.fecha ?? "");
  const hora_inicio = String(body.hora_inicio ?? "");
  const hora_fin = String(body.hora_fin ?? "");

  if (!nombre || !fecha || !hora_inicio || !hora_fin) {
    return noStore(NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 422 }));
  }

  const { error } = await supabaseService().from("sesiones").insert({
    nombre, fecha, hora_inicio, hora_fin,
  });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}

/** Elimina una sesión (?id=). Solo admin. */
export async function DELETE(req: Request) {
  if (!await getSession()) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return noStore(NextResponse.json({ error: "id requerido" }, { status: 422 }));
  const { error } = await supabaseService().from("sesiones").delete().eq("id", id);
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}
