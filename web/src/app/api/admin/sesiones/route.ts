export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const nombre = String(body.nombre ?? "").trim();
  const taller = Number(body.taller_numero);
  const fecha = String(body.fecha ?? "");
  const hora_inicio = String(body.hora_inicio ?? "");
  const hora_fin = String(body.hora_fin ?? "");

  if (!nombre || !taller || !fecha || !hora_inicio || !hora_fin) {
    return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 422 });
  }
  const { error } = await supabaseService().from("sesiones").insert({ nombre, taller_numero: taller, fecha, hora_inicio, hora_fin });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 422 });
  const { error } = await supabaseService().from("sesiones").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
