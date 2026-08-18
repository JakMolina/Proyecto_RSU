export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface Params { params: { id: string } }

/** Detalle de un taller (con su sesión y materiales). Solo admin. */
export async function GET(_req: Request, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();
  const { data: taller, error } = await sb.from("talleres")
    .select("id, session_id, nombre, descripcion, orden, activo, creado_en, sesiones(id, nombre, fecha, hora_inicio, hora_fin)")
    .eq("id", params.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!taller) return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });

  const { data: materiales } = await sb.from("materiales")
    .select("id, nombre, descripcion, nombre_archivo, mime_type, bytes, storage_path, creado_en")
    .eq("taller_id", params.id)
    .order("creado_en", { ascending: false });

  return NextResponse.json({ taller, sesion: (taller as any).sesiones ?? null, materiales: materiales ?? [] });
}

/** Edita un taller (nombre, descripcion, orden, activo). Solo admin. */
export async function PATCH(req: Request, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const patch: Record<string, any> = {};
  if (body.nombre !== undefined) {
    const n = String(body.nombre).trim();
    if (!n) return NextResponse.json({ error: "Nombre no puede estar vacío" }, { status: 422 });
    patch.nombre = n;
  }
  if (body.descripcion !== undefined) {
    patch.descripcion = String(body.descripcion).trim() || null;
  }
  if (body.orden !== undefined) {
    const o = Number(body.orden);
    if (!Number.isInteger(o) || o < 1) return NextResponse.json({ error: "Orden inválido" }, { status: 422 });
    const { data: dup } = await supabaseService().from("talleres")
      .select("id").eq("orden", o).neq("id", params.id).maybeSingle();
    if (dup) return NextResponse.json({ error: "Ese orden ya lo usa otro taller" }, { status: 409 });
    patch.orden = o;
  }
  if (body.activo !== undefined) {
    patch.activo = !!body.activo;
  }

  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nada que actualizar" }, { status: 422 });
  const { error } = await supabaseService().from("talleres").update(patch).eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Elimina un taller (cascade de materiales). Solo admin. */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { error } = await supabaseService().from("talleres").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
