export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

function validarDni(d: string): boolean {
  return /^\d{8}$/.test(d);
}
function validarWhatsapp(w: string): boolean {
  return /^(\+?51)?\s?9\d{8}$/.test(w.replace(/\s|-/g, ""));
}

/** Listar docentes registrados (solo admin). */
export async function GET() {
  if (!(await getSession())) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const { data, error } = await supabaseService()
    .from("participantes")
    .select("id, dni, nombre_completo, whatsapp, creado_en")
    .order("creado_en", { ascending: false });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ docentes: data ?? [] }));
}

/** Registrar docente: solo el administrador puede dar de alta docentes. */
export async function POST(req: Request) {
  if (!(await getSession())) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));

  const body = await req.json().catch(() => null);
  if (!body) return noStore(NextResponse.json({ error: "JSON inválido" }, { status: 400 }));

  const dni = String(body.dni ?? "").trim();
  const nombres = String(body.nombres ?? "").trim();
  const apellidos = String(body.apellidos ?? "").trim();
  const whatsapp = String(body.whatsapp ?? "").trim();

  if (!validarDni(dni)) return noStore(NextResponse.json({ error: "DNI inválido (8 dígitos)." }, { status: 422 }));
  if (!nombres || !apellidos) return noStore(NextResponse.json({ error: "Nombres y apellidos obligatorios." }, { status: 422 }));
  if (!validarWhatsapp(whatsapp)) return noStore(NextResponse.json({ error: "WhatsApp inválido. Ej: +51 987654321." }, { status: 422 }));

  // Service role (servidor) para saltar RLS en la verificación de duplicados;
  // la restricción UNIQUE(dni) de la BD igual garantiza unicidad.
  const sb = supabaseService();
  const { data: exist } = await sb.from("participantes").select("id").eq("dni", dni).maybeSingle();
  if (exist) return noStore(NextResponse.json({ error: "Ya existe un docente con ese DNI." }, { status: 409 }));

  const { error } = await sb.from("participantes").insert({ dni, nombres, apellidos, whatsapp });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}
