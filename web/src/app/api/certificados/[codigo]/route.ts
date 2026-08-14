export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { generarCertificadoPdf } from "@/lib/pdf";

export async function GET(req: Request, { params }: { params: { codigo: string } }) {
  const codigo = params.codigo.trim();
  const sb = supabaseService();

  const { data: cert } = await sb
    .from("certificados")
    .select("id, codigo_verif, porcentaje, generado_en, storage_path, participante_id, participantes!inner(nombre_completo, dni, whatsapp)")
    .eq("codigo_verif", codigo)
    .maybeSingle() as any;

  if (!cert) return NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 });

  const url = new URL(req.url);
  if (url.searchParams.get("download") === "1") {
    // Tomar programa_fechas de parámetros (fallback a valor por defecto)
    const { data: fParam } = await sb
      .from("parametros")
      .select("valor")
      .eq("clave", "programa_fechas")
      .maybeSingle();
    const programaFechas = fParam?.valor ?? "07 y 08 de julio de 2026";

    // Regenerar el PDF al vuelo con el diseño actual de pdf.tsx.
    // Así las descargas siempre reflejan la última versión del diseño,
    // sin depender de que el admin haya pulsado "Generar".
    const pdfBuf = await generarCertificadoPdf({
      nombresApellidos: cert.participantes?.nombre_completo ?? "",
      porcentaje: Number(cert.porcentaje ?? 0),
      codigoVerificacion: cert.codigo_verif,
      programaFechas,
    });

    // Actualizar la copia en Storage (upsert) para que el WhatsApp
    // y futuras descargas sirvan el diseño actualizado.
    if (cert.participantes?.dni) {
      const storagePath = `${cert.participantes.dni}/${cert.codigo_verif}.pdf`;
      await sb.storage
        .from("certificados")
        .upload(storagePath, pdfBuf, { contentType: "application/pdf", upsert: true });
      if (storagePath !== cert.storage_path) {
        await sb.from("certificados").update({ storage_path: storagePath }).eq("id", cert.id);
      }
    }

    return new NextResponse(new Uint8Array(pdfBuf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${cert.codigo_verif}.pdf"`,
      },
    });
  }

  return NextResponse.json({
    codigo_verif: cert.codigo_verif,
    porcentaje: cert.porcentaje,
    generado_en: cert.generado_en,
    nombre_completo: cert.participantes?.nombre_completo,
    tiene_pdf: !!cert.storage_path,
    certificado_id: cert.id,
  });
}
