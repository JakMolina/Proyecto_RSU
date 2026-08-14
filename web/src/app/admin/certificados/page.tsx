export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import { CertActions } from "./CertActions";

export default async function AdminCertificadosPage() {
  const session = await getSession();
  if (!session) return null;
  const sb = supabaseService();

  const [{ data: parts }, { count: totalSes }, { data: certs }] = await Promise.all([
    sb.from("participantes").select("id, dni, nombre_completo, whatsapp").order("creado_en", { ascending: false }),
    sb.from("sesiones").select("*", { count: "exact", head: true }),
    sb.from("certificados").select("id, participante_id, codigo_verif, porcentaje"),
  ]);

  const totalSesN = totalSes ?? 0;
  const certMap = new Map((certs ?? []).map((c: any) => [c.participante_id, c]));

  const rows = (parts ?? []).map((p: any) => ({ p, cert: certMap.get(p.id) ?? null, totalSes: totalSesN }));

  // contar asistencias por participante
  const { data: asis } = await sb.from("asistencias").select("participante_id");
  const asisCount = new Map<string, number>();
  (asis ?? []).forEach((a: any) => asisCount.set(a.participante_id, (asisCount.get(a.participante_id) ?? 0) + 1));

  const [{ data: umbralRow }] = await Promise.all([
    sb.from("parametros").select("valor").eq("clave", "umbral_asistencia_min").maybeSingle(),
  ]);
  const umbral = Number(umbralRow?.valor ?? 75);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Certificados</h1>
      <p className="text-slate-600">Umbral mínimo: <span className="font-semibold text-brand-700">{umbral}%</span> de {totalSesN} sesiones.</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Docente</th>
              <th className="px-3 py-2">% asistencia</th>
              <th className="px-3 py-2">Certificado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, cert }) => {
              const asis = totalSesN ? asisCount.get(p.id) ?? 0 : 0;
              const pct = totalSesN ? Math.round((asis / totalSesN) * 100) : 0;
              const cumple = pct >= umbral;
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{p.dni}</td>
                  <td className="px-3 py-2">{p.nombre_completo}</td>
                  <td className="px-3 py-2">{pct}%</td>
                  <td className="px-3 py-2">
                    {cert ? (
                      <a className="text-brand-700 underline" href={`/verificar`}>
                        <span className="font-mono">{cert.codigo_verif}</span>
                      </a>
                    ) : cumple ? (
                      <span className="badge bg-amber-100 text-amber-800">listo</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-600">no cumple</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <CertActions participanteId={p.id} certificadoId={cert?.id ?? null} codigoVerif={cert?.codigo_verif ?? null} cumple={cumple} />
                  </td>
                </tr>
              );
            })}
            {!rows.length && <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={5}>Sin participantes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
