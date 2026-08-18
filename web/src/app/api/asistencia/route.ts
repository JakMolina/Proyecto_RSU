export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService, supabaseConfigurado } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

/** Extrae los 8 dígitos del DNI de un texto leído del código de barras. */
function extraerDni(raw: string): string | null {
  const m = raw.match(/\d{8}/);
  return m ? m[0] : null;
}

export async function POST(req: Request) {
  if (!supabaseConfigurado()) {
    return noStore(NextResponse.json(
      { error: "Supabase no configurado. Revisa .env.local." },
      { status: 500 }
    ));
  }

  // Solo un administrador autenticado puede registrar asistencia.
  // El docente NO debe escanear su propio DNI (riesgo de auto-asistencia).
  const admin = await getSession();
  if (!admin) {
    return noStore(NextResponse.json(
      { error: "Acceso restringido. Inicia sesión como administrador." },
      { status: 401 }
    ));
  }

  const body = await req.json().catch(() => null);
  if (!body) return noStore(NextResponse.json({ error: "JSON inválido" }, { status: 400 }));

  const raw = String(body.codigo ?? "").trim();
  const sesionId = String(body.sesion_id ?? "").trim();

  if (!sesionId) return noStore(NextResponse.json({ error: "Sesión no seleccionada" }, { status: 422 }));

  const dni = extraerDni(raw);
  if (!dni) return noStore(NextResponse.json({ error: "No se reconocieron 8 dígitos de DNI" }, { status: 422 }));

  // Service role (servidor) para que RLS no bloquee el lookup por DNI;
  // la URL de la API nunca expone la service_role key.
  const sb = supabaseService();

  // VALIDACIÓN CRÍTICA: Verificar que la sesión existe ANTES de insertar
  // Esto evita el error FK "asistencias_sesion_id_fkey"
  const { data: sesionExiste, error: se } = await sb
    .from("sesiones")
    .select("id")
    .eq("id", sesionId)
    .maybeSingle();
  if (se) return noStore(NextResponse.json({ error: se.message }, { status: 500 }));
  if (!sesionExiste) {
    return noStore(NextResponse.json(
      { error: "La sesión seleccionada no existe. Recarga la página y selecciona una sesión válida.", status: "sesion_no_existe" },
      { status: 422 }
    ));
  }

  const { data: part, error: ep } = await sb
    .from("participantes")
    .select("id, nombre_completo")
    .eq("dni", dni)
    .maybeSingle();
  if (ep) return noStore(NextResponse.json({ error: ep.message }, { status: 500 }));
  if (!part) return noStore(NextResponse.json({ error: `DNI ${dni} no está registrado`, status: "no_registrado" }, { status: 404 }));

  // Verificar duplicado
  const { data: dup } = await sb
    .from("asistencias")
    .select("id")
    .eq("participante_id", part.id)
    .eq("sesion_id", sesionId)
    .maybeSingle();
  if (dup) return noStore(NextResponse.json({ error: "Ya registró asistencia a esta sesión", status: "duplicado", nombre: part.nombre_completo }, { status: 409 }));

  const { error } = await sb.from("asistencias").insert({
    participante_id: part.id,
    sesion_id: sesionId,
  });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));

  return noStore(NextResponse.json({ ok: true, nombre: part.nombre_completo, dni }));
}
