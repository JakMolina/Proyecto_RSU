export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) return null;
  const sb = supabaseService();

  const [{ count: totalPart }, { count: totalSes }, { count: totalAsis }, { count: totalCert }, { count: enviosOk }, { count: enviosFail }] = await Promise.all([
    sb.from("participantes").select("*", { count: "exact", head: true }),
    sb.from("sesiones").select("*", { count: "exact", head: true }),
    sb.from("asistencias").select("*", { count: "exact", head: true }),
    sb.from("certificados").select("*", { count: "exact", head: true }),
    sb.from("envios_whatsapp").select("*", { count: "exact", head: true }).eq("estado", "ENVIADO"),
    sb.from("envios_whatsapp").select("*", { count: "exact", head: true }).eq("estado", "FALLIDO"),
  ]);

  const cards = [
    { label: "Docentes registrados", value: totalPart ?? 0, href: "/admin/participantes" },
    { label: "Sesiones programadas", value: totalSes ?? 0, href: "/admin/sesiones" },
    { label: "Asistencias registradas", value: totalAsis ?? 0, href: "/admin/asistencias" },
    { label: "Certificados generados", value: totalCert ?? 0, href: "/admin/certificados" },
    { label: "WhatsApp enviados", value: enviosOk ?? 0 },
    { label: "WhatsApp fallidos", value: enviosFail ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href ?? "#"} className="card p-5" aria-disabled={!c.href}>
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="text-3xl font-bold text-brand-700">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
