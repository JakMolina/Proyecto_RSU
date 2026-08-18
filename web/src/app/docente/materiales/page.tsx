export const dynamic = "force-dynamic";
import { getDocente } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import Link from "next/link";

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default async function DocenteMaterialesPage() {
  const doc = await getDocente();
  if (!doc) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Acceso restringido</h1>
        <p className="mt-2 text-slate-600">Inicia sesión como docente para ver los materiales.</p>
        <Link href="/login?as=docente" className="btn-primary mt-5">Iniciar sesión</Link>
      </div>
    );
  }

  const sb = supabaseService();

  // Talleres activos + sus materiales (join). Si la migración FASE 3 aún no se
  // aplicó, no hay talleres/materiales y se muestra mensaje amigable.
  let materiales: any[] = [];
  let talleresMap = new Map<string, { nombre: string; orden: number }>();
  try {
    const { data, error } = await sb
      .from("materiales")
      .select("id, nombre, descripcion, nombre_archivo, bytes, mime_type, taller_id, talleres!inner(nombre, orden, activo)")
      .order("creado_en", { ascending: false });
    if (!error && data) {
      // Filtrar sólo talleres activos (el !inner ya exige el join; el activo
      // se comprueba aquí para no exponer materiales de talleres inactivos).
      materiales = (data as any[]).filter((m) => m.talleres?.activo !== false);
      materiales.forEach((m) => {
        const t = m.talleres;
        if (t && !talleresMap.has(m.taller_id)) {
          talleresMap.set(m.taller_id, { nombre: t.nombre, orden: t.orden });
        }
      });
    }
  } catch {
    // tablas inexistentes -> lista vacía
  }

  // Agrupar por taller (respetando el orden de taller)
  const talleresOrden = [...talleresMap.entries()].sort((a, b) => a[1].orden - b[1].orden);
  const vacio = !materiales.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Materiales</h1>
        <p className="text-slate-600">
          Recursos y materiales de los talleres del programa. Pulsa &laquo;Descargar&raquo; para obtener el archivo.
        </p>
      </div>

      {vacio ? (
        <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
          <span className="text-3xl">📁</span>
          <p className="text-slate-600">Aún no hay materiales disponibles.</p>
          <p className="text-sm text-slate-400">
            El administrador puede subir materiales desde el detalle de cada taller.
          </p>
        </div>
      ) : (
        talleresOrden.map(([tid, t]) => {
          const mats = materiales.filter((m) => m.taller_id === tid);
          if (!mats.length) return null;
          return (
            <section key={tid} className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  <Link href={`/docente/talleres/${tid}`} className="hover:underline">
                    {t.nombre}
                  </Link>
                </h2>
                <Link href={`/docente/talleres/${tid}`} className="text-xs text-brand-700 hover:underline">
                  Ver taller →
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {mats.map((m) => (
                  <div key={m.id} className="card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{m.nombre}</p>
                        <p className="truncate text-xs text-slate-500">
                          {m.nombre_archivo} · {fmtBytes(m.bytes)} · {m.mime_type}
                        </p>
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
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
