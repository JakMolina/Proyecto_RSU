export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { enviarWhatsappDocumento, normalizarNumero } from "@/lib/whatsapp";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  // Acepta certificado_id (uno) o masivo: { todos: true }
  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? SUPA_URL;

  const { data: msgData } = await sb.from("parametros").select("valor").eq("clave", "mensaje_whatsapp").single();
  const caption = msgData?.valor ?? "";

  let certIds: string[] = [];
  if (body.todos) {
    const { data } = await sb.from("certificados").select("id").eq("storage_path", "not.null");
    certIds = (data ?? []).map((c: any) => c.id);
  } else if (body.certificado_id) {
    certIds = [String(body.certificado_id)];
  } else {
    return NextResponse.json({ error: "certificado_id o todos=true requerido" }, { status: 422 });
  }

  const resultados: any[] = [];
  for (const id of certIds) {
    const { data: cert } = await sb
      .from("certificados")
      .select("id, codigo_verif, storage_path, participante_id, participantes!inner(nombre_completo, dni, whatsapp)")
      .eq("id", id)
      .maybeSingle() as any;
    if (!cert || !cert.storage_path) {
      resultados.push({ id, ok: false, error: "sin PDF" });
      continue;
    }

    const to = normalizarNumero(cert.participantes.whatsapp);
    const pdfUrl = `${SUPA_URL}/storage/v1/object/public/certificados/${cert.storage_path}`;
    const res = await enviarWhatsappDocumento(to, pdfUrl, `certificado-${cert.codigo_verif}.pdf`, caption);

    await sb.from("envios_whatsapp").insert({
      certificado_id: cert.id,
      estado: res.ok ? "ENVIADO" : "FALLIDO",
      intentos: 1,
      respuesta_api: res.ok ? res.messageId ?? "ok" : res.error ?? "error",
      enviado_en: res.ok ? new Date().toISOString() : null,
    });

    resultados.push({ id, ok: res.ok, error: res.error });
  }

  const ok = resultados.filter((r) => r.ok).length;
  const fail = resultados.filter((r) => !r.ok).length;
  return NextResponse.json({ ok: true, enviados: ok, fallidos: fail, detalles: resultados });
}
