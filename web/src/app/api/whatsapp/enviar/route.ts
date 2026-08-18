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

  const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const { data: msgData } = await sb.from("parametros").select("valor").eq("clave", "mensaje_whatsapp").single();
  const caption = msgData?.valor ?? "";

  const SHOULD_SKIP_WA = !process.env.WHATSAPP_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID;

  console.log("[WhatsApp API] Config check:", { 
    hasToken: !!process.env.WHATSAPP_API_TOKEN, 
    hasPhoneId: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
    tokenPrefix: process.env.WHATSAPP_API_TOKEN?.slice(0, 10) + "..."
  });

  // ---- Envío individual ----
  if (body.certificado_id) {
    const id = String(body.certificado_id);
    const { data: cert } = await sb
      .from("certificados")
      .select("id, codigo_verif, storage_path, storage_path_pmi, participante_id, participantes!inner(nombre_completo, dni, whatsapp)")
      .eq("id", id)
      .maybeSingle() as any;
    if (!cert || !cert.storage_path) {
      return NextResponse.json({ error: "sin certificado" }, { status: 422 });
    }
    const to = normalizarNumero(cert.participantes.whatsapp);
    if (SHOULD_SKIP_WA) {
      const motivo = "WHATSAPP no configurado";
      await sb.from("envios_whatsapp").insert({
        certificado_id: cert.id, estado: "FALLIDO", intentos: 1,
        respuesta_api: motivo, enviado_en: null,
      });
      return NextResponse.json({ ok: false, enviados: 0, fallidos: 1, omitidos: 0, detalles: [{ id, ok: false, error: motivo }] });
    }

    const resultados = [];

    // Enviar UNC
    const pdfUrlUnc = `${SUPA_URL}/storage/v1/object/public/certificados/${cert.storage_path}`;
    const resUnc = await enviarWhatsappDocumento(to, pdfUrlUnc, `certificado-${cert.codigo_verif}-UNC.pdf`, caption);
    await sb.from("envios_whatsapp").insert({
      certificado_id: cert.id,
      estado: resUnc.ok ? "ENVIADO" : "FALLIDO",
      intentos: 1,
      respuesta_api: resUnc.ok ? resUnc.messageId ?? "ok" : resUnc.error ?? "error",
      enviado_en: resUnc.ok ? new Date().toISOString() : null,
    });
    resultados.push({ tipo: "UNC", ok: resUnc.ok, error: resUnc.error });

    // Enviar PMI si existe
    if (cert.storage_path_pmi) {
      const pdfUrlPmi = `${SUPA_URL}/storage/v1/object/public/certificados/${cert.storage_path_pmi}`;
      const resPmi = await enviarWhatsappDocumento(to, pdfUrlPmi, `certificado-${cert.codigo_verif}-PMI.pdf`, caption);
      await sb.from("envios_whatsapp").insert({
        certificado_id: cert.id,
        estado: resPmi.ok ? "ENVIADO" : "FALLIDO",
        intentos: 1,
        respuesta_api: resPmi.ok ? resPmi.messageId ?? "ok" : resPmi.error ?? "error",
        enviado_en: resPmi.ok ? new Date().toISOString() : null,
      });
      resultados.push({ tipo: "PMI", ok: resPmi.ok, error: resPmi.error });
    }

    const okCount = resultados.filter(r => r.ok).length;
    return NextResponse.json({ ok: okCount > 0, enviados: okCount, fallidos: resultados.length - okCount, omitidos: 0, detalles: resultados });
  }

  // ---- Envío MASIVO ----
  if (!body.todos) {
    return NextResponse.json({ error: "certificado_id o todos=true requerido" }, { status: 422 });
  }

  // Certificados con PDF disponible + participante con WhatsApp
  const { data: certificados } = await sb
    .from("certificados")
    .select("id, codigo_verif, storage_path, storage_path_pmi, participante_id, participantes!inner(nombre_completo, dni, whatsapp)")
    .not("storage_path", "is", null);

  // Estado del último envío por certificado (para omitir los ENVIADO y
  // reintentar los FALLIDO).
  const { data: envios } = await sb.from("envios_whatsapp")
    .select("certificado_id, estado, creado_en")
    .order("creado_en", { ascending: false });
  const lastByCert = new Map<string, string>();
  (envios ?? []).forEach((e: any) => {
    if (!lastByCert.has(e.certificado_id)) lastByCert.set(e.certificado_id, e.estado);
  });

  const omitidos: any[] = [];
  const detalles: any[] = [];
  const total = certificados?.length ?? 0;

  for (const cert of certificados ?? []) {
    const part = Array.isArray(cert.participantes) ? cert.participantes[0] : cert.participantes;
    const wa = part?.whatsapp ?? "";
    if (!cert.storage_path) {
      omitidos.push({ id: cert.id, motivo: "sin certificado" });
      continue;
    }
    if (!/^(\+?51)?\s?9\d{8}$/.test(wa.replace(/\s|-/g, ""))) {
      omitidos.push({ id: cert.id, motivo: "WhatsApp inválido" });
      continue;
    }
    const estadoUlt = lastByCert.get(cert.id);
    if (estadoUlt === "ENVIADO") {
      omitidos.push({ id: cert.id, motivo: "ya enviado" });
      continue;
    }

    if (SHOULD_SKIP_WA) {
      const motivo = "WHATSAPP no configurado";
      await sb.from("envios_whatsapp").insert({
        certificado_id: cert.id, estado: "FALLIDO", intentos: 1,
        respuesta_api: motivo, enviado_en: null,
      });
      detalles.push({ id: cert.id, ok: false, error: motivo });
      continue;
    }

    const to = normalizarNumero(wa);

    // Enviar UNC
    const pdfUrlUnc = `${SUPA_URL}/storage/v1/object/public/certificados/${cert.storage_path}`;
    const resUnc = await enviarWhatsappDocumento(to, pdfUrlUnc, `certificado-${cert.codigo_verif}-UNC.pdf`, caption);
    await sb.from("envios_whatsapp").insert({
      certificado_id: cert.id,
      estado: resUnc.ok ? "ENVIADO" : "FALLIDO",
      intentos: 1,
      respuesta_api: resUnc.ok ? resUnc.messageId ?? "ok" : resUnc.error ?? "error",
      enviado_en: resUnc.ok ? new Date().toISOString() : null,
    });
    detalles.push({ id: cert.id, tipo: "UNC", ok: resUnc.ok, error: resUnc.error });

    // Enviar PMI si existe
    if (cert.storage_path_pmi) {
      const pdfUrlPmi = `${SUPA_URL}/storage/v1/object/public/certificados/${cert.storage_path_pmi}`;
      const resPmi = await enviarWhatsappDocumento(to, pdfUrlPmi, `certificado-${cert.codigo_verif}-PMI.pdf`, caption);
      await sb.from("envios_whatsapp").insert({
        certificado_id: cert.id,
        estado: resPmi.ok ? "ENVIADO" : "FALLIDO",
        intentos: 1,
        respuesta_api: resPmi.ok ? resPmi.messageId ?? "ok" : resPmi.error ?? "error",
        enviado_en: resPmi.ok ? new Date().toISOString() : null,
      });
      detalles.push({ id: cert.id, tipo: "PMI", ok: resPmi.ok, error: resPmi.error });
    }
  }

  const env = detalles.filter((d) => d.ok).length;
  const fail = detalles.filter((d) => !d.ok).length;
  return NextResponse.json({
    ok: true,
    total,
    enviados: env,
    fallidos: fail,
    omitidos: omitidos.length,
    detalle_omitidos: omitidos,
    detalle_envios: detalles,
  });
}