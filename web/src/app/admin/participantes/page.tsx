export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";

export default async function AdminParticipantesPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = supabaseService();
  const { data } = await sb.from("participantes").select("id, dni, nombre_completo, whatsapp, creado_en").order("creado_en", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Participantes</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Docente</th>
              <th className="px-3 py-2">WhatsApp</th>
              <th className="px-3 py-2">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p: any) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 font-mono">{p.dni}</td>
                <td className="px-3 py-2">{p.nombre_completo}</td>
                <td className="px-3 py-2">{p.whatsapp}</td>
                <td className="px-3 py-2 text-slate-500">{new Date(p.creado_en).toLocaleString("es-PE")}</td>
              </tr>
            ))}
            {!(data?.length) && (
              <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={4}>Sin registros aún</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
