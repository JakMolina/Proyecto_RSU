export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { generarCertificadoUNCPdf, generarCertificadoPMIPdf } from "@/lib/certificados-imagen";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET(req: Request, { params }: { params: { codigo: string } }) {
  const codigo = params.codigo.trim();
  const sb = supabaseService();

  const { data: cert } = await sb
    .from("certificados")
    .select("id, codigo_verif, porcentaje, generado_en, storage_path, storage_path_pmi, participante_id, participantes!inner(nombre_completo, dni, whatsapp)")
    .eq("codigo_verif", codigo)
    .maybeSingle() as any;

  if (!cert) return noStore(NextResponse.json({ error: "Certificado no encontrado" }, { status: 404 }));

  const url = new URL(req.url);
  const download = url.searchParams.get("download") === "1";
  const tipo = url.searchParams.get("tipo"); // "unc" | "pmi"

  const datosCertificado = {
    nombresApellidos: cert.participantes?.nombre_completo ?? "",
  };

  if (download) {
    let pdfBuf: Buffer;
    let filename: string;
    let storagePath: string;

    if (tipo === "pmi") {
      pdfBuf = await generarCertificadoPMIPdf(datosCertificado);
      filename = `certificado-${cert.codigo_verif}-PMI.pdf`;
      storagePath = `${cert.participantes?.dni}/${cert.codigo_verif}-pmi.pdf`;
    } else {
      pdfBuf = await generarCertificadoUNCPdf(datosCertificado);
      filename = `certificado-${cert.codigo_verif}-UNC.pdf`;
      storagePath = `${cert.participantes?.dni}/${cert.codigo_verif}-unc.pdf`;
    }

    if (cert.participantes?.dni) {
      await sb.storage.from("certificados").upload(storagePath, pdfBuf, { contentType: "application/pdf", upsert: true });
    }

    return new NextResponse(new Uint8Array(pdfBuf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return noStore(NextResponse.json({
    codigo_verif: cert.codigo_verif,
    porcentaje: cert.porcentaje,
    generado_en: cert.generado_en,
    nombre_completo: cert.participantes?.nombre_completo,
    tiene_unc: !!cert.storage_path,
    tiene_pmi: !!cert.storage_path_pmi,
    certificado_id: cert.id,
  }));
}