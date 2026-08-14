/**
 * Generación del certificado PDF con @react-pdf/renderer.
 * Se ejecuta en el servidor (route handler / api) para evitar cargar la
 * librería en el bundle del cliente.
 *
 * Diseño: certificado formal en UNA sola página A4 horizontal (842×595pt).
 * Paleta navy (#0b2545) + acento oro (#a47e3b), borde doble decorativo,
 * footer anclado al fondo con flex, paddings compactos para garantizar
 * que el contenido nunca desborde a una segunda hoja.
 */
import { Buffer } from "node:buffer";

export type CertData = {
  nombresApellidos: string;
  porcentaje: number;
  codigoVerificacion: string;
  programaFechas: string;
};

export async function generarCertificadoPdf(data: CertData): Promise<Buffer> {
  const { renderToBuffer, Document, Page, Text, View, StyleSheet } =
    await import("@react-pdf/renderer");

  const NAVY = "#0b2545";
  const GOLD = "#a47e3b";
  const INK = "#1a1a1a";
  const MUTE = "#555555";

  const styles = StyleSheet.create({
    page: { padding: 26, fontFamily: "Helvetica", backgroundColor: "#ffffff" },
    outer: { borderWidth: 2.5, borderColor: NAVY, borderRadius: 6, padding: 7, flex: 1 },
    inner: {
      borderWidth: 0.8,
      borderColor: GOLD,
      borderRadius: 3,
      padding: 20,
      flex: 1,
      flexDirection: "column",
    },
    topBand: {
      textAlign: "center",
      paddingBottom: 8,
      borderBottomWidth: 0.6,
      borderBottomColor: GOLD,
      marginBottom: 10,
    },
    inst: { fontSize: 10, fontWeight: "bold", color: NAVY, letterSpacing: 1.2 },
    subInst: { fontSize: 8, color: MUTE, marginTop: 2, letterSpacing: 0.6 },
    kicker: { fontSize: 10, color: GOLD, letterSpacing: 3, textAlign: "center", marginTop: 4 },
    title: { fontSize: 26, fontWeight: "bold", color: NAVY, textAlign: "center", marginTop: 4, letterSpacing: 1 },
    subtitle: { fontSize: 10, color: MUTE, textAlign: "center", marginTop: 4, letterSpacing: 0.5 },
    awarded: { fontSize: 10, color: MUTE, textAlign: "center", marginTop: 12 },
    name: {
      fontSize: 21,
      fontWeight: "bold",
      color: INK,
      textAlign: "center",
      marginTop: 4,
      paddingBottom: 6,
      borderBottomWidth: 0.6,
      borderBottomColor: "#d8c9a8",
      marginLeft: 70,
      marginRight: 70,
    },
    body: {
      fontSize: 10.5,
      lineHeight: 1.45,
      color: INK,
      textAlign: "center",
      marginTop: 10,
      marginLeft: 36,
      marginRight: 36,
    },
    percent: { fontSize: 13, fontWeight: "bold", color: NAVY, textAlign: "center", marginTop: 6 },
    // Bloque inferior anclado al fondo del contenedor flex
    bottom: { marginTop: "auto", paddingTop: 12 },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 24,
    },
    signCol: { width: "42%", textAlign: "center" },
    signLine: { borderWidth: 0, borderBottomWidth: 0.8, borderBottomColor: INK, marginBottom: 4, marginLeft: 16, marginRight: 16 },
    signName: { fontSize: 10, fontWeight: "bold", color: INK },
    signRole: { fontSize: 8, color: MUTE, marginTop: 2 },
    codeBlock: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
    codePill: {
      borderWidth: 0.6,
      borderColor: GOLD,
      borderRadius: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      fontSize: 8.5,
      color: MUTE,
      letterSpacing: 0.4,
    },
    codeStrong: { fontWeight: "bold", color: NAVY },
  });

  const doc = (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outer}>
          <View style={styles.inner}>
            {/* Encabezado institucional */}
            <View style={styles.topBand}>
              <Text style={styles.inst}>UNIVERSIDAD NACIONAL DE CAJAMARCA</Text>
              <Text style={styles.subInst}>
                Facultad de Ingeniería · Escuela Profesional de Ingeniería de Sistemas
              </Text>
            </View>

            {/* Título */}
            <Text style={styles.kicker}>CERTIFICA</Text>
            <Text style={styles.title}>CERTIFICADO DE APROBACIÓN</Text>
            <Text style={styles.subtitle}>
              Programa “Capacitación Docente en Uso Ético, Responsable y Pedagógico de la IA” · CDWC-IA
            </Text>

            {/* Nombre */}
            <Text style={styles.awarded}>Otorgado a</Text>
            <Text style={styles.name}>{data.nombresApellidos}</Text>

            {/* Cuerpo */}
            <Text style={styles.body}>
              Por haber aprobado el programa de capacitación realizado los días{" "}
              {data.programaFechas} en la I.E.P. Wez College, alcanzando el porcentaje de asistencia exigido.
            </Text>
            <Text style={styles.percent}>Asistencia: {data.porcentaje}%</Text>

            {/* Bloque inferior anclado al fondo */}
            <View style={styles.bottom}>
              <View style={styles.footer}>
                <View style={styles.signCol}>
                  <View style={styles.signLine} />
                  <Text style={styles.signName}>Universidad Nacional de Cajamarca</Text>
                  <Text style={styles.signRole}>Entidad académica responsable</Text>
                </View>
                <View style={styles.signCol}>
                  <View style={styles.signLine} />
                  <Text style={styles.signName}>I.E.P. Wez College</Text>
                  <Text style={styles.signRole}>Institución sede</Text>
                </View>
              </View>

              <View style={styles.codeBlock}>
                <Text style={styles.codePill}>
                  Código de verificación:{" "}
                  <Text style={styles.codeStrong}>{data.codigoVerificacion}</Text>
                  {"   ·   Verifica en el sitio web CDWC-IA"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  ) as any;

  const buf: any = await renderToBuffer(doc as any);
  return Buffer.from(buf);
}
