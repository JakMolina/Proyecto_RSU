export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";

export default async function AdminAsistenciasPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = supabaseService();
  const { data } = await sb
    .from("asistencias")
    .select("id, registrado_en, participantes!inner(dni, nombre_completo), sesiones!inner(nombre)")
    .order("registrado_en", { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Asistencias</h1>
        <a className="btn-ghost" href="/api/export/asistencia">Exportar CSV</a>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Docente</th>
              <th className="px-3 py-2">Sesión</th>
              <th className="px-3 py-2">Hora</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((a: any) => (
              <tr key={a.id} className="border-t">
                <td className="px-3 py-2 font-mono">{a.participantes?.dni}</td>
                <td className="px-3 py-2">{a.participantes?.nombre_completo}</td>
                <td className="px-3 py-2">{a.sesiones?.nombre}</td>
                <td className="px-3 py-2 text-slate-500">{new Date(a.registrado_en).toLocaleString("es-PE")}</td>
              </tr>
            ))}
            {!data?.length && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>Sin registros</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
