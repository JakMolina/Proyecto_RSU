export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

type TallerOut = {
  id: string;
  session_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
  sesion_nombre: string | null;
  sesion_fecha: string | null;
  materiales: number;
};

/** Lista talleres (con su sesión y conteo de materiales). Solo admin. */
export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();

  const { data: talleres, error } = await sb
    .from("talleres")
    .select("id, session_id, nombre, descripcion, orden, activo, creado_en, sesiones!inner(nombre, fecha)")
    .order("orden", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: mats } = await sb.from("materiales").select("taller_id");
  const counts = new Map<string, number>();
  (mats ?? []).forEach((m: any) => {
    counts.set(m.taller_id, (counts.get(m.taller_id) ?? 0) + 1);
  });

  const out: TallerOut[] = (talleres ?? []).map((t: any) => ({
    id: t.id,
    session_id: t.session_id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    orden: t.orden,
    activo: t.activo,
    creado_en: t.creado_en,
    sesion_nombre: t.sesiones?.nombre ?? null,
    sesion_fecha: t.sesiones?.fecha ?? null,
    materiales: counts.get(t.id) ?? 0,
  }));
  return NextResponse.json({ talleres: out });
}

/** Crea un taller dentro de una sesión. Solo admin.
 *  Body: { session_id, nombre, descripcion?, orden } */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const session_id = String(body.session_id ?? "").trim();
  const nombre = String(body.nombre ?? "").trim();
  const descripcion = String(body.descripcion ?? "").trim() || null;
  const orden = Number(body.orden ?? 1);

  if (!session_id) return NextResponse.json({ error: "session_id obligatorio" }, { status: 422 });
  if (!nombre) return NextResponse.json({ error: "Nombre obligatorio" }, { status: 422 });
  if (!Number.isInteger(orden) || orden < 1) {
    return NextResponse.json({ error: "Orden inválido (entero ≥ 1)" }, { status: 422 });
  }

  const sb = supabaseService();
  const { data: sesion } = await sb.from("sesiones").select("id").eq("id", session_id).maybeSingle();
  if (!sesion) return NextResponse.json({ error: "La sesión indicada no existe" }, { status: 422 });

  const { data, error } = await sb.from("talleres")
    .insert({ session_id, nombre, descripcion, orden })
    .select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
