export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

type Row = {
  dni: string;
  participante: string;
  sesion: string;
  fecha: string;
  hora: string;
  talleres: string;
  registrado_en: string;
};

/** Reporte de asistencia filtrable por sesión. Solo admin.
 *  Query params: ?sesion_id=  (sin filtros: todas las asistencias).
 *  La asistencia se toma por SESIÓN (no por taller); la columna "talleres"
 *  es informativa (lista de talleres de esa sesión, separados por coma). */
export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const url = new URL(req.url);
  const sesion_id = (url.searchParams.get("sesion_id") ?? "").trim();

  const sb = supabaseService();

  // 1) Sesiones en alcance (con sus talleres adjuntos)
  let sesionesQ: any = sb.from("sesiones")
    .select("id, nombre, fecha, hora_inicio, talleres(id, nombre, orden)");
  if (sesion_id) sesionesQ = sesionesQ.eq("id", sesion_id);
  sesionesQ = sesionesQ.order("fecha").order("hora_inicio");
  const { data: sesiones, error: se } = await sesionesQ;
  if (se) return NextResponse.json({ error: se.message }, { status: 500 });

  const sesionesMap = new Map<string, any>((sesiones ?? []).map((s: any) => [s.id, s]));
  const sesIds = (sesiones ?? []).map((s: any) => s.id);

  // 2) Asistencias dentro del alcance
  let asisQ = sb.from("asistencias")
    .select("id, sesion_id, registrado_en, participantes!inner(dni, nombre_completo)")
    .order("registrado_en", { ascending: false });
  if (sesion_id) {
    asisQ = asisQ.eq("sesion_id", sesion_id);
  } else if (sesIds.length) {
    asisQ = asisQ.in("sesion_id", sesIds);
  }
  const { data: asis, error: ae } = await asisQ;
  if (ae) return NextResponse.json({ error: ae.message }, { status: 500 });

  const rows: Row[] = (asis ?? []).map((a: any) => {
    const s = sesionesMap.get(a.sesion_id);
    const talleresNombres = (s?.talleres ?? [])
      .slice()
      .sort((x: any, y: any) => x.orden - y.orden)
      .map((t: any) => t.nombre)
      .join(", ");
    return {
      dni: a.participantes?.dni ?? "",
      participante: a.participantes?.nombre_completo ?? "",
      sesion: s?.nombre ?? "",
      fecha: s?.fecha ?? "",
      hora: s ? `${s.hora_inicio ?? ""}` : "",
      talleres: talleresNombres || "—",
      registrado_en: a.registrado_en,
    };
  });

  return NextResponse.json({ rows, total: rows.length });
}
