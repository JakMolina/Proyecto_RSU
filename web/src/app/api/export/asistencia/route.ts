export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { toCsv } from "@/lib/csv";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();
  const { data: asistencias, error } = await sb
    .from("asistencias")
    .select("id, registrado_en, participante_id, sesion_id, participantes!inner(dni, nombre_completo), sesiones!inner(nombre)")
    .order("registrado_en", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (asistencias ?? []).map((a: any) => ({
    dni: a.participantes?.dni,
    docente: a.participantes?.nombre_completo,
    sesion: a.sesiones?.nombre,
    registrado_en: a.registrado_en,
  }));

  const csv = toCsv(rows, ["dni", "docente", "sesion", "registrado_en"]);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="asistencia-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
