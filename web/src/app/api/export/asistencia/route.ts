export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { toCsv } from "@/lib/csv";
import { getSession } from "@/lib/auth";

/** Exporta asistencia en CSV respetando el filtro de /api/admin/reportes
 *  (?sesion_id=). Sin filtros: todas las asistencias.
 *  La asistencia es por SESIÓN; la columna "talleres" es informativa. */
export async function GET(req: Request) {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();

  const url = new URL(req.url);
  const sesion_id = (url.searchParams.get("sesion_id") ?? "").trim();

  let sesionesQ: any = sb.from("sesiones")
    .select("id, nombre, fecha, hora_inicio, talleres(id, nombre, orden)");
  if (sesion_id) sesionesQ = sesionesQ.eq("id", sesion_id);
  sesionesQ = sesionesQ.order("fecha").order("hora_inicio");
  const { data: sesiones } = await sesionesQ;
  const sesionesMap = new Map<string, any>((sesiones ?? []).map((s: any) => [s.id, s]));

  const sesIds = (sesiones ?? []).map((s: any) => s.id);

  let asisQ = sb.from("asistencias")
    .select("id, registrado_en, sesion_id, participantes!inner(dni, nombre_completo)")
    .order("registrado_en", { ascending: false });
  if (sesion_id) {
    asisQ = asisQ.eq("sesion_id", sesion_id);
  } else if (sesIds.length) {
    asisQ = asisQ.in("sesion_id", sesIds);
  }

  const { data: asis } = await asisQ;
  const rows = (asis ?? []).map((a: any) => {
    const s = sesionesMap.get(a.sesion_id);
    const talleresNombres = (s?.talleres ?? [])
      .slice()
      .sort((x: any, y: any) => x.orden - y.orden)
      .map((t: any) => t.nombre)
      .join(", ");
    return {
      dni: a.participantes?.dni,
      participante: a.participantes?.nombre_completo,
      sesion: s?.nombre ?? "",
      fecha: s?.fecha ?? "",
      hora: s?.hora_inicio ?? "",
      talleres: talleresNombres || "—",
      registrado_en: a.registrado_en,
    };
  });

  const csv = toCsv(rows, ["dni", "participante", "sesion", "fecha", "hora", "talleres", "registrado_en"]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="asistencia-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
