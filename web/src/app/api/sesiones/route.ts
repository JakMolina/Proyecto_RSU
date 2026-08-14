export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService, supabaseConfigurado } from "@/lib/supabase";

export async function GET() {
  if (!supabaseConfigurado()) {
    return NextResponse.json(
      { error: "Supabase no configurado. Revisa .env.local." },
      { status: 500 }
    );
  }
  // Usamos service_role (servidor) para saltar RLS: las sesiones son info
  // pública (nombre/fecha/hora) que se muestra en la landing y en el escáner
  // móvil, y evita que un RLS mal aplicado deje el dropdown vacío.
  const sb = supabaseService();
  const { data, error } = await sb
    .from("sesiones")
    .select("id, nombre, fecha, hora_inicio, hora_fin, taller_numero")
    .order("fecha", { ascending: true })
    .order("hora_inicio", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ sesiones: data });
}
