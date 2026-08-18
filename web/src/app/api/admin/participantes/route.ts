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

/** Listar participantes. */
export async function GET() {
  if (!(await getSession())) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const { data, error } = await supabaseService()
    .from("participantes")
    .select("id, dni, nombres, apellidos, nombre_completo, whatsapp, creado_en")
    .order("creado_en", { ascending: false });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ participantes: data ?? [] }));
}

/** Crear participante. */
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

  const sb = supabaseService();
  const { data: exist } = await sb.from("participantes").select("id").eq("dni", dni).maybeSingle();
  if (exist) return noStore(NextResponse.json({ error: "Ya existe un participante con ese DNI." }, { status: 409 }));

  const { error } = await sb.from("participantes").insert({ dni, nombres, apellidos, whatsapp });
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}

/** Editar participante. Body: { dni?, nombres?, apellidos?, whatsapp? }
 *  El dni IDENTIFICA al participante (no se permite cambiar el DNI). */
export async function PATCH(req: Request) {
  if (!(await getSession())) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const body = await req.json().catch(() => null);
  if (!body) return noStore(NextResponse.json({ error: "JSON inválido" }, { status: 400 }));

  const id = String(body.id ?? "").trim();
  if (!id) return noStore(NextResponse.json({ error: "id requerido" }, { status: 422 }));

  const patch: Record<string, any> = {};
  if (body.dni !== undefined) {
    const dni = String(body.dni).trim();
    if (!validarDni(dni)) return noStore(NextResponse.json({ error: "DNI inválido (8 dígitos)." }, { status: 422 }));
    // Verificar unicidad de DNI en otro registro
    const { data: dup } = await supabaseService().from("participantes")
      .select("id").eq("dni", dni).neq("id", id).maybeSingle();
    if (dup) return noStore(NextResponse.json({ error: "Ese DNI ya lo usa otro participante." }, { status: 409 }));
    patch.dni = dni;
  }
  if (body.nombres !== undefined) {
    const n = String(body.nombres).trim();
    if (!n) return noStore(NextResponse.json({ error: "Nombres obligatorio." }, { status: 422 }));
    patch.nombres = n;
  }
  if (body.apellidos !== undefined) {
    const a = String(body.apellidos).trim();
    if (!a) return noStore(NextResponse.json({ error: "Apellidos obligatorio." }, { status: 422 }));
    patch.apellidos = a;
  }
  if (body.whatsapp !== undefined) {
    const w = String(body.whatsapp).trim();
    if (!validarWhatsapp(w)) return noStore(NextResponse.json({ error: "WhatsApp inválido. Ej: +51 987654321." }, { status: 422 }));
    patch.whatsapp = w;
  }

  if (!Object.keys(patch).length) return noStore(NextResponse.json({ error: "Nada que actualizar" }, { status: 422 }));
  const { error } = await supabaseService().from("participantes").update(patch).eq("id", id);
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}

/** Eliminar participante (?id=). */
export async function DELETE(req: Request) {
  if (!(await getSession())) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return noStore(NextResponse.json({ error: "id requerido" }, { status: 422 }));
  const sb = supabaseService();

  // Borrar certificados/envíos asociados primero (cascade en BD, pero por si acaso)
  const { data: certs } = await sb.from("certificados").select("id").eq("participante_id", id);
  if (certs?.length) {
    await sb.from("envios_whatsapp").delete().in("certificado_id", certs.map((c: any) => c.id));
    await sb.from("certificados").delete().eq("participante_id", id);
  }

  const { error } = await sb.from("participantes").delete().eq("id", id);
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}
