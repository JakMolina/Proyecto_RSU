export const dynamic = "force-dynamic";
import { getDocente } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import Link from "next/link";

type SesionLite = { id: string; nombre: string; fecha: string };
type TallerLite = {
  id: string;
  session_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  materiales: number;
};

export default async function DocenteTalleresPage() {
  const doc = await getDocente();
  if (!doc) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-slate-600">Necesitas iniciar sesión como docente para ver los talleres.</p>
        <Link href="/login?as=docente" className="btn-primary mt-5">Iniciar sesión</Link>
      </div>
    );
  }

  const sb = supabaseService();
  const [{ data: sesiones }, { data: talleresRaw }, { data: mats }] = await Promise.all([
    sb.from("sesiones").select("id, nombre, fecha").order("fecha").order("hora_inicio"),
    sb.from("talleres").select("id, session_id, nombre, descripcion, orden").eq("activo", true).order("orden"),
    sb.from("materiales").select("taller_id"),
  ]);

  const matCount = new Map<string, number>();
  (mats ?? []).forEach((m: any) => {
    matCount.set(m.taller_id, (matCount.get(m.taller_id) ?? 0) + 1);
  });
  const talleres: TallerLite[] = (talleresRaw ?? []).map((t: any) => ({
    id: t.id, session_id: t.session_id, nombre: t.nombre,
    descripcion: t.descripcion, orden: t.orden,
    materiales: matCount.get(t.id) ?? 0,
  }));

  const sesionesList: SesionLite[] = (sesiones ?? []) as any;
  const sesionesMap = new Map(sesionesList.map((s) => [s.id, s]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Talleres</h1>
        <p className="text-slate-600">
          Los talleres se agrupan por <strong>sesión</strong>. Entra a cada taller para descargar sus materiales.
        </p>
      </div>

      {(talleres ?? []).length === 0 ? (
        <div className="card p-8 text-center text-slate-500">Aún no hay talleres disponibles.</div>
      ) : (
        sesionesList.map((s) => {
          const talleresSesion = talleres.filter((t) => t.session_id === s.id);
          if (!talleresSesion.length) return null;
          const fechaFmt = new Date(s.fecha + "T00:00").toLocaleDateString("es-PE", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          });
          return (
            <section key={s.id} className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{s.nombre}</h2>
                <p className="text-sm text-slate-500">{fechaFmt}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {talleresSesion.map((t) => (
                  <Link key={t.id} href={`/docente/talleres/${t.id}`} className="card group p-5 transition hover:shadow-md">
                    <p className="text-xs font-medium text-slate-400">Orden {t.orden}</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-900 group-hover:text-brand-700">{t.nombre}</h3>
                    {t.descripcion && <p className="mt-1 text-sm text-slate-600">{t.descripcion}</p>}
                    <p className="mt-3 text-xs text-slate-500">{t.materiales} material(es)</p>
                    <span className="mt-3 inline-block text-sm font-medium text-brand-700">Ver taller →</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
