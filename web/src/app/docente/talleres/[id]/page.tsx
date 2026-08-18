export const dynamic = "force-dynamic";
import { getDocente } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

type MaterialResumido = {
  id: string;
  nombre: string;
  descripcion: string | null;
  nombre_archivo: string;
  bytes: number;
  mime_type: string;
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DocenteTallerDetallePage({ params }: { params: { id: string } }) {
  const doc = await getDocente();
  if (!doc) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-slate-600">Inicia sesión como docente para ver este taller.</p>
        <Link href="/login?as=docente" className="btn-primary mt-5">Iniciar sesión</Link>
      </div>
    );
  }

  const sb = supabaseService();

  // Taller (solo si está activo) + su sesión
  const { data: taller } = await sb.from("talleres")
    .select("id, session_id, nombre, descripcion, orden, activo, sesiones(id, nombre, fecha, hora_inicio, hora_fin)")
    .eq("id", params.id)
    .maybeSingle();
  if (!taller || !taller.activo) notFound();

  const sesion = (taller as any).sesiones ?? null;

  // ¿El docente asistió a la sesión de este taller?
  let asistioSesion = false;
  if (sesion?.id) {
    const { data: asis } = await sb.from("asistencias")
      .select("id")
      .eq("participante_id", doc.id)
      .eq("sesion_id", sesion.id)
      .maybeSingle();
    asistioSesion = !!asis;
  }

  const { data: materiales } = await sb.from("materiales")
    .select("id, nombre, descripcion, nombre_archivo, bytes, mime_type")
    .eq("taller_id", taller.id)
    .order("creado_en", { ascending: false });

  const mats = (materiales ?? []) as MaterialResumido[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/docente/talleres" className="text-sm text-brand-700 underline">← Volver a talleres</Link>
        <p className="mt-1 text-xs font-medium text-slate-400">Taller · orden {taller.orden}</p>
        <h1 className="text-2xl font-bold">{taller.nombre}</h1>
        {taller.descripcion && <p className="mt-1 text-slate-600">{taller.descripcion}</p>}
      </div>

      {sesion ? (
        <section className="card p-4">
          <p className="text-xs font-medium text-slate-400">Sesión a la que pertenece</p>
          <p className="font-semibold text-slate-900">{sesion.nombre}</p>
          <p className="text-sm text-slate-500">
            {new Date(sesion.fecha + "T00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · {sesion.hora_inicio}–{sesion.hora_fin}
          </p>
          <p className="mt-2">
            {asistioSesion ? (
              <span className="badge bg-emerald-100 text-emerald-700">Asistió a la sesión ✓</span>
            ) : (
              <span className="badge bg-slate-100 text-slate-500">Asistencia pendiente</span>
            )}
          </p>
        </section>
      ) : (
        <p className="text-sm text-slate-500">Este taller no tiene sesión asignada.</p>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Materiales</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {mats.map((m) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{m.nombre}</p>
                  <p className="truncate text-xs text-slate-500">{m.nombre_archivo} · {fmtBytes(m.bytes)} · {m.mime_type}</p>
                </div>
              </div>
              {m.descripcion && <p className="mt-2 text-sm text-slate-600">{m.descripcion}</p>}
              <a
                className="btn-primary mt-3 inline-block"
                href={`/api/materiales/${m.id}`}
                target="_blank"
                rel="noreferrer"
              >
                Descargar material
              </a>
            </div>
          ))}
          {!mats.length && <p className="text-slate-500">Este taller aún no tiene materiales.</p>}
        </div>
      </section>
    </div>
  );
}
