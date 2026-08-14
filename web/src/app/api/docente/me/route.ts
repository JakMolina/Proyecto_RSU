export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getDocente } from "@/lib/auth";
import { supabaseService, supabaseConfigurado } from "@/lib/supabase";

/** Devuelve el panel completo del docente logueado: progreso, sesiones, certificado. */
export async function GET() {
  if (!supabaseConfigurado()) {
    return NextResponse.json({ error: "Supabase no configurado" }, { status: 500 });
  }
  const doc = await getDocente();
  if (!doc) return NextResponse.json({ error: "No has iniciado sesión" }, { status: 401 });

  const sb = supabaseService();

  // Sesiones del programa (todas, ordenadas)
  const { data: sesiones } = await sb
    .from("sesiones")
    .select("id, nombre, taller_numero, fecha, hora_inicio, hora_fin")
    .order("fecha", { ascending: true })
    .order("hora_inicio", { ascending: true });

  // Asistencias del docente
  const { data: asistencias } = await sb
    .from("asistencias")
    .select("sesion_id, registrado_en")
    .eq("participante_id", doc.id);

  const asistenciasSet = new Set((asistencias ?? []).map((a: any) => a.sesion_id));
  const totalSesiones = sesiones?.length ?? 0;
  const asistidasCount = asistenciasSet.size;
  const pct = totalSesiones > 0 ? Math.round((asistidasCount / totalSesiones) * 100) : 0;

  // Umbral
  const { data: umbralRow } = await sb
    .from("parametros")
    .select("valor")
    .eq("clave", "umbral_asistencia_min")
    .maybeSingle();
  const umbral = Number(umbralRow?.valor ?? 75);

  // Certificado del docente (si existe)
  const { data: cert } = await sb
    .from("certificados")
    .select("id, codigo_verif, porcentaje, generado_en, storage_path")
    .eq("participante_id", doc.id)
    .maybeSingle();

  const sesionesDetalle = (sesiones ?? []).map((s: any) => ({
    id: s.id,
    nombre: s.nombre,
    taller_numero: s.taller_numero,
    fecha: s.fecha,
    hora_inicio: s.hora_inicio,
    hora_fin: s.hora_fin,
    asistio: asistenciasSet.has(s.id),
    registrado_en: (asistencias ?? []).find((a: any) => a.sesion_id === s.id)?.registrado_en ?? null,
  }));

  return NextResponse.json({
    docente: {
      id: doc.id,
      dni: doc.dni,
      nombre: doc.nombre,
    },
    progreso: {
      total_sesiones: totalSesiones,
      asistidas: asistidasCount,
      porcentaje: pct,
      umbral,
      cumple: pct >= umbral,
    },
    certificado: cert
      ? {
          id: cert.id,
          codigo_verif: cert.codigo_verif,
          porcentaje: Number(cert.porcentaje),
          generado_en: cert.generado_en,
          tiene_pdf: !!cert.storage_path,
        }
      : null,
    sesiones: sesionesDetalle,
  });
}
