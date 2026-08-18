export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { generarAmbosCertificadosPdf } from "@/lib/certificados-imagen";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "JSON inválido" }, { status: 400 });

  const participanteId = String(body.participante_id ?? "").trim();
  if (!participanteId) return NextResponse.json({ error: "participante_id requerido" }, { status: 422 });

  const { data: part } = await sb.from("participantes").select("id, dni, nombres, apellidos, nombre_completo, whatsapp").eq("id", participanteId).maybeSingle();
  if (!part) return NextResponse.json({ error: "Participante no encontrado" }, { status: 404 });

  // Calcular porcentaje
  const { data: pctRow } = await sb.rpc("calcular_porcentaje_asistencia", { p_participante: part.id }).single();
  const porcentaje = Number(pctRow ?? 0);

  // Umbral
  const { data: param } = await sb.from("parametros").select("valor").eq("clave", "umbral_asistencia_min").single();
  const umbral = Number(param?.valor ?? 75);
  if (porcentaje < umbral) {
    return NextResponse.json({ error: `No alcanza el umbral (${porcentaje}% < ${umbral}%)` }, { status: 409 });
  }

  // Fecha programa
  const { data: fParam } = await sb.from("parametros").select("valor").eq("clave", "programa_fechas").single();
  const programaFechas = fParam?.valor ?? "07 y 08 de julio de 2026";

  // ¿Ya existe?
  let { data: cert } = await sb.from("certificados").select("*").eq("participante_id", part.id).maybeSingle();

  if (!cert) {
    const { data: created, error } = await sb.from("certificados").insert({ participante_id: part.id, porcentaje }).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    cert = created;
  } else {
    await sb.from("certificados").update({ porcentaje }).eq("id", cert.id);
  }

  // Generar ambos PDFs (UNC y PMI)
  const { unc, pmi } = await generarAmbosCertificadosPdf({
    nombresApellidos: part.nombre_completo,
  });

  // Subir certificado UNC
  const storagePathUnc = `${part.dni}/${cert.codigo_verif}-unc.pdf`;
  const { error: upErrUnc } = await sb.storage.from("certificados").upload(storagePathUnc, unc, { contentType: "application/pdf", upsert: true });
  if (upErrUnc) return NextResponse.json({ error: upErrUnc.message }, { status: 500 });

  // Subir certificado PMI
  const storagePathPmi = `${part.dni}/${cert.codigo_verif}-pmi.pdf`;
  const { error: upErrPmi } = await sb.storage.from("certificados").upload(storagePathPmi, pmi, { contentType: "application/pdf", upsert: true });
  if (upErrPmi) return NextResponse.json({ error: upErrPmi.message }, { status: 500 });

  // Guardar ambas rutas en el certificado
  await sb.from("certificados").update({ 
    storage_path: storagePathUnc,
    storage_path_pmi: storagePathPmi
  }).eq("id", cert.id);

  return NextResponse.json({ 
    ok: true, 
    certificado_id: cert.id, 
    codigo_verif: cert.codigo_verif, 
    porcentaje, 
    storage_path_unc: storagePathUnc,
    storage_path_pmi: storagePathPmi,
    whatsapp: part.whatsapp 
  });
}
