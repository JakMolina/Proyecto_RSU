export const dynamic = "force-dynamic";
import { getDocente } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import Link from "next/link";
import { PanelDocente } from "./PanelDocente";

export default async function DocentePage() {
  const doc = await getDocente();
  if (!doc) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-slate-600">Necesitas iniciar sesión como docente para ver tu panel.</p>
        <Link href="/login?as=docente" className="btn-primary mt-5">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const sb = supabaseService();
  const [{ data: sesiones }, { data: asistencias }, { data: cert }, { data: umbralRow }, { data: talleresRaw }, { data: matsCount }] = await Promise.all([
    sb.from("sesiones").select("id, nombre, fecha, hora_inicio, hora_fin").order("fecha").order("hora_inicio"),
    sb.from("asistencias").select("sesion_id, registrado_en").eq("participante_id", doc.id),
    sb.from("certificados").select("id, codigo_verif, porcentaje, generado_en, storage_path").eq("participante_id", doc.id).maybeSingle(),
    sb.from("parametros").select("valor").eq("clave", "umbral_asistencia_min").maybeSingle(),
    sb.from("talleres").select("id, session_id, nombre, descripcion, orden").eq("activo", true).order("orden"),
    sb.from("materiales").select("taller_id"),
  ]);

  const asisSet = new Set((asistencias ?? []).map((a: any) => a.sesion_id));
  const sesionesSerializable = (sesiones ?? []).map((s: any) => ({
    ...s,
    asistio: asisSet.has(s.id),
  }));
  const totalSes = sesionesSerializable.length;
  const asisCount = sesionesSerializable.filter((s: any) => s.asistio).length;
  const pct = totalSes > 0 ? Math.round((asisCount / totalSes) * 100) : 0;
  const umbral = Number(umbralRow?.valor ?? 75);

  // Conteo de materiales por taller
  const matCount = new Map<string, number>();
  (matsCount ?? []).forEach((m: any) => {
    matCount.set(m.taller_id, (matCount.get(m.taller_id) ?? 0) + 1);
  });

  // Por taller: ¿asistió a la sesión que lo contiene? (cada taller tiene 1 sesión)
  const talleresSerializable = (talleresRaw ?? []).map((t: any) => {
    const asistioSesion = t.session_id ? asisSet.has(t.session_id) : false;
    return {
      id: t.id,
      session_id: t.session_id,
      nombre: t.nombre,
      descripcion: t.descripcion,
      orden: t.orden,
      sesiones_total: t.session_id ? 1 : 0,
      sesiones_asistidas: asistioSesion ? 1 : 0,
      materiales: matCount.get(t.id) ?? 0,
    };
  });

  return (
    <PanelDocente
      docente={{ dni: doc.dni, nombre: doc.nombre }}
      talleres={talleresSerializable}
      progreso={{ total: totalSes, asistidas: asisCount, porcentaje: pct, umbral, cumple: pct >= umbral }}
      certificado={
        cert
          ? { codigo_verif: cert.codigo_verif, porcentaje: Number(cert.porcentaje), tiene_pdf: !!cert.storage_path }
          : null
      }
    />
  );
}
