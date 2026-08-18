export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService, supabaseConfigurado } from "@/lib/supabase";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET() {
  if (!supabaseConfigurado()) {
    return noStore(NextResponse.json(
      { error: "Supabase no configurado. Revisa .env.local." },
      { status: 500 }
    ));
  }
  // Service role (servidor) para saltar RLS: las sesiones son info
  // pública (nombre/fecha/hora) que se muestra en la landing y en el escáner
  // móvil, y evita que un RLS mal aplicado deje el dropdown vacío.
  const sb = supabaseService();

  const { data, error } = await sb
    .from("sesiones")
    .select("id, nombre, fecha, hora_inicio, hora_fin")
    .order("fecha", { ascending: true })
    .order("hora_inicio", { ascending: true });
    console.log("=== DIAGNOSTICO /api/sesiones ===");
console.log("TOTAL SESIONES:", data?.length ?? 0);
console.log("SESIONES:", JSON.stringify(data));
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SERVICE ROLE EXISTE:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));

  const sesiones = (data ?? []).map((s: any) => ({
    id: s.id,
    nombre: s.nombre,
    fecha: s.fecha,
    hora_inicio: s.hora_inicio,
    hora_fin: s.hora_fin,
  }));
  return noStore(NextResponse.json({ sesiones }));
}
