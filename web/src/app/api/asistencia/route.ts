export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService, supabaseConfigurado } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

/** Extrae los 8 dígitos del DNI de un texto leído del código de barras. */
function extraerDni(raw: string): string | null {
  const m = raw.match(/\d{8}/);
  return m ? m[0] : null;
}

export async function POST(req: Request) {
  if (!supabaseConfigurado()) {
    return NextResponse.json(
      { error: "Supabase no configurado. Revisa .env.local." },
      { status: 500 }
    );
  }

  // Solo un administrador autenticado puede registrar asistencia.
  // El docente NO debe escanear su propio DNI (riesgo de auto-asistencia).
  const admin = await getSession();
  if (!admin) {
    return NextResponse.json(
      { error: "Acceso restringido. Inicia sesión como administrador." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const raw = String(body.codigo ?? "").trim();
  const sesionId = String(body.sesion_id ?? "").trim();

  if (!sesionId) return NextResponse.json({ error: "Sesión no seleccionada" }, { status: 422 });

  const dni = extraerDni(raw);
  if (!dni) return NextResponse.json({ error: "No se reconocieron 8 dígitos de DNI" }, { status: 422 });

  // Service role (servidor) para que RLS no bloquee el lookup por DNI;
  // la URL de la API nunca expone la service_role key.
  const sb = supabaseService();

  const { data: part, error: ep } = await sb
    .from("participantes")
    .select("id, nombre_completo")
    .eq("dni", dni)
    .maybeSingle();
  if (ep) return NextResponse.json({ error: ep.message }, { status: 500 });
  if (!part) return NextResponse.json({ error: `DNI ${dni} no está registrado`, status: "no_registrado" }, { status: 404 });

  // Verificar duplicado
  const { data: dup } = await sb
    .from("asistencias")
    .select("id")
    .eq("participante_id", part.id)
    .eq("sesion_id", sesionId)
    .maybeSingle();
  if (dup) return NextResponse.json({ error: "Ya registró asistencia a esta sesión", status: "duplicado", nombre: part.nombre_completo }, { status: 409 });

  const { error } = await sb.from("asistencias").insert({
    participante_id: part.id,
    sesion_id: sesionId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, nombre: part.nombre_completo, dni });
}
