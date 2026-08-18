export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";
import { supabaseService } from "@/lib/supabase";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) return null;
  const sb = supabaseService();

  const results = await Promise.allSettled([
    sb.from("participantes").select("*", { count: "exact", head: true }),
    sb.from("talleres").select("*", { count: "exact", head: true }),
    sb.from("sesiones").select("*", { count: "exact", head: true }),
    sb.from("asistencias").select("*", { count: "exact", head: true }),
    sb.from("certificados").select("*", { count: "exact", head: true }),
    sb.from("envios_whatsapp").select("*", { count: "exact", head: true }).eq("estado", "ENVIADO"),
    sb.from("envios_whatsapp").select("*", { count: "exact", head: true }).eq("estado", "FALLIDO"),
  ]);
  const val = (i: number) => results[i].status === "fulfilled" ? (results[i].value.count ?? 0) : 0;

  const cards = [
    { label: "Docentes registrados", value: val(0), href: "/admin/participantes" },
    { label: "Talleres", value: val(1), href: "/admin/talleres" },
    { label: "Sesiones programadas", value: val(2), href: "/admin/sesiones" },
    { label: "Asistencias registradas", value: val(3), href: "/admin/asistencias" },
    { label: "Certificados generados", value: val(4), href: "/admin/certificados" },
    { label: "WhatsApp enviados", value: val(5) },
    { label: "WhatsApp fallidos", value: val(6) },
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
