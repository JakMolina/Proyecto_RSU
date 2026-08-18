import { Buffer } from "node:buffer";
import { supabaseService } from "@/lib/supabase";

const PUBLIC_DIR = process.cwd();

// A4 horizontal en puntos (1 punto = 1/72 pulgada)
const PAGE_W = 842;
const PAGE_H = 595;

export type CertificadoImagenData = {
  nombresApellidos: string;
};

// Configuración de posición del nombre por tipo de certificado
// Ajusta estos valores según tus plantillas
const POSICION_NOMBRE = {
  unc: {
    left: 105,
    top: 270,    // ← SUBE el nombre en UNC (menor = más arriba)
    width: 600,
    fontSize: 22,
  },
  pmi: {
    left: 120,
    top: 290,    // ← SUBE el nombre en PMI (menor = más arriba)
    width: 600,
    fontSize: 22,
  },
};

// Cache para URLs públicas
let cachedUrls: { unc: string; pmi: string } | null = null;

async function obtenerUrlsPlantillas(): Promise<{ unc: string; pmi: string }> {
  if (cachedUrls) return cachedUrls;

  const sb = supabaseService();
  
  const { data: unc } = sb.storage.from("certificados").getPublicUrl("plantillas/certificado-unc.png");
  const { data: pmi } = sb.storage.from("certificados").getPublicUrl("plantillas/certificado-pmi2.png");

  cachedUrls = {
    unc: unc.publicUrl,
    pmi: pmi.publicUrl,
  };
  
  return cachedUrls;
}

async function generarCertificadoPdf(
  data: CertificadoImagenData,
  tipo: "unc" | "pmi"
): Promise<Buffer> {
  const urls = await obtenerUrlsPlantillas();
  const fondoUrl = tipo === "unc" ? urls.unc : urls.pmi;

  if (!fondoUrl) throw new Error(`URL de plantilla ${tipo} no configurada`);

  const { renderToBuffer, Document, Page, Text, Image, StyleSheet, Font } = await import("@react-pdf/renderer");

  // Registrar fuentes si existen localmente
  const fs = await import("node:fs");
  const path = await import("node:path");
  
  const montserratBold = path.join(PUBLIC_DIR, "public", "fonts", "Montserrat-Bold.ttf");
  const montserratRegular = path.join(PUBLIC_DIR, "public", "fonts", "Montserrat-Regular.ttf");

  if (fs.existsSync(montserratBold)) {
    Font.register({ family: "Montserrat", src: montserratBold, fontWeight: 700 });
  }
  if (fs.existsSync(montserratRegular)) {
    Font.register({ family: "Montserrat", src: montserratRegular, fontWeight: 400 });
  }

  // Obtener posición específica para este tipo
  const pos = POSICION_NOMBRE[tipo];

  const styles = StyleSheet.create({
    page: {
      width: PAGE_W,
      height: PAGE_H,
    },
    fondo: {
      position: "absolute",
      left: 0,
      top: 0,
      width: PAGE_W,
      height: PAGE_H,
    },
    nombre: {
      position: "absolute",
      left: pos.left,
      top: pos.top,
      width: pos.width,
      fontFamily: "Montserrat",
      fontSize: pos.fontSize,
      fontWeight: 700,
      color: "#000000",
      textAlign: "center",
    },
  });

  const doc = (
    <Document>
      <Page size={[PAGE_W, PAGE_H]} style={styles.page}>
        <Image 
          src={fondoUrl} 
          style={styles.fondo}
        />
        <Text style={styles.nombre}>{data.nombresApellidos.toUpperCase()}</Text>
      </Page>
    </Document>
  );

  return Buffer.from(await renderToBuffer(doc));
}

export async function generarCertificadoUNCPdf(
  data: CertificadoImagenData
): Promise<Buffer> {
  return generarCertificadoPdf(data, "unc");
}

export async function generarCertificadoPMIPdf(
  data: CertificadoImagenData
): Promise<Buffer> {
  return generarCertificadoPdf(data, "pmi");
}

export async function generarAmbosCertificadosPdf(
  data: CertificadoImagenData
): Promise<{ unc: Buffer; pmi: Buffer }> {
  const [unc, pmi] = await Promise.all([
    generarCertificadoUNCPdf(data),
    generarCertificadoPMIPdf(data),
  ]);
  return { unc, pmi };
}