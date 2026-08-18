/**
 * ================================================================
 * GENERADOR DE CERTIFICADOS PDF
 * ================================================================
 *
 * Librería:
 *   @react-pdf/renderer
 *
 * FORMATO:
 *   A4 HORIZONTAL
 *
 * DIMENSIONES PDF:
 *   842 × 595 puntos
 *
 * FONDO:
 *   3508 × 2480 px
 *   300 DPI
 *
 * DISEÑO:
 *   - Fondo oscuro con nodos cobre/bronce
 *   - Composición asimétrica
 *   - Arte visual predominante en el lado izquierdo
 *   - Información editorial concentrada en el lado derecho
 *   - Tipografía Montserrat + Playfair Display
 *   - Nombre del participante como elemento principal
 *
 * RECURSOS:
 *
 * public/
 * ├── certificado-fondo.png
 * ├── logo-unc.png
 * ├── logo-wez.png
 * └── fonts/
 *     ├── Montserrat-Regular.ttf
 *     ├── Montserrat-Medium.ttf
 *     ├── Montserrat-Bold.ttf
 *     └── PlayfairDisplay-Bold.ttf
 *
 * ================================================================
 */

import { Buffer } from "node:buffer";
import fs from "node:fs";
import path from "node:path";

// ================================================================
// TIPOS
// ================================================================

export type CertData = {
  // --------------------------------------------------------------
  // PARTICIPANTE
  // --------------------------------------------------------------

  nombresApellidos: string;

  // --------------------------------------------------------------
  // PROGRAMA
  // --------------------------------------------------------------

  nombrePrograma?: string;
  codigoPrograma?: string;

  // --------------------------------------------------------------
  // FECHAS Y ASISTENCIA
  // --------------------------------------------------------------

  programaFechas: string;
  porcentaje: number;

  // --------------------------------------------------------------
  // VERIFICACIÓN
  // --------------------------------------------------------------

  codigoVerificacion: string;

  // --------------------------------------------------------------
  // INFORMACIÓN INSTITUCIONAL
  // --------------------------------------------------------------

  universidad?: string;
  facultad?: string;
  escuela?: string;

  // --------------------------------------------------------------
  // FIRMA UNIVERSIDAD
  // --------------------------------------------------------------

  responsableUniversidad?: string;
  cargoUniversidad?: string;

  // --------------------------------------------------------------
  // FIRMA WEZ COLLEGE
  // --------------------------------------------------------------

  responsableWez?: string;
  cargoWez?: string;
};

// ================================================================
// CONFIGURACIÓN
// ================================================================

const PUBLIC_DIR = path.join(process.cwd(), "public");

// ================================================================
// A4 HORIZONTAL
// ================================================================
//
// A4 vertical:
//   595 × 842 pt
//
// A4 horizontal:
//   842 × 595 pt
//
// Tu imagen:
//   3508 × 2480 px
//
// Relación aproximada:
//   3508 / 2480 = 1.4145
//
// A4 horizontal:
//   842 / 595 = 1.4151
//
// Por lo tanto, la imagen corresponde perfectamente al formato.
// ================================================================

const PAGE_W = 842;
const PAGE_H = 595;

// ================================================================
// PALETA
// ================================================================

const COLORS = {
  BRONZE: "#D8AA62",

  BRONZE_DARK: "#C5A059",

  WHITE: "#FFFFFF",

  LIGHT: "#E0E4EB",

  MUTED: "#AAB3C0",

  BACKGROUND: "#101820",

  BLACK: "#111111",
};

// ================================================================
// VALORES POR DEFECTO
// ================================================================

const DEFAULTS = {
  universidad: "UNIVERSIDAD NACIONAL DE CAJAMARCA",

  facultad: "Facultad de Ingeniería",

  escuela:
    "Escuela Profesional de Ingeniería de Sistemas",

  programa:
    "Capacitación Docente en Uso Ético, Responsable y Pedagógico de la IA",

  codigoPrograma: "CDWC-IA",

  institucionSede: "I.E.P. Wez College",

  textoVerificacion:
    "Verifica en el sitio web CDWC-IA",
};

// ================================================================
// RESOLVER ARCHIVOS
// ================================================================

/**
 * Busca el primer archivo existente dentro de public/.
 *
 * Devuelve:
 *   - path: ruta física
 *   - src: imagen convertida a Base64
 *
 * Si no encuentra ninguno:
 *   null
 */
function resolver(
  candidatos: string[],
): { path: string; src: string } | null {
  for (const candidato of candidatos) {
    const archivo = path.join(PUBLIC_DIR, candidato);

    if (!fs.existsSync(archivo)) {
      continue;
    }

    const ext = path.extname(archivo).toLowerCase();

    let mime = "image/png";

    if (ext === ".jpg" || ext === ".jpeg") {
      mime = "image/jpeg";
    }

    if (ext === ".webp") {
      mime = "image/webp";
    }

    const base64 = fs.readFileSync(archivo).toString("base64");

    return {
      path: archivo,
      src: `data:${mime};base64,${base64}`,
    };
  }

  return null;
}

// ================================================================
// FONDO DEL CERTIFICADO
// ================================================================

const FONDO = resolver([
  "certificado-fondo.png",
  "certificado-fondo.jpg",
  "certificado-fondo.jpeg",
  "fondo-certificado.png",
  "fondo-certificado.jpg",
]);

// ================================================================
// LOGOS
// ================================================================

function cargarLogo(
  candidatos: string[],
): string | null {
  return resolver(candidatos)?.src ?? null;
}

// ================================================================
// FUENTES
// ================================================================

function buscarFuente(
  candidatos: string[],
): string | null {
  for (const candidato of candidatos) {
    const archivo = path.join(
      PUBLIC_DIR,
      "fonts",
      candidato,
    );

    if (fs.existsSync(archivo)) {
      return archivo;
    }
  }

  return null;
}

// ================================================================
// GENERAR CERTIFICADO
// ================================================================

export async function generarCertificadoPdf(
  data: CertData,
): Promise<Buffer> {
  // ==============================================================
  // IMPORTACIÓN DINÁMICA
  // ==============================================================

  const {
    renderToBuffer,
    Document,
    Page,
    Text,
    View,
    Image,
    StyleSheet,
    Font,
  } = await import("@react-pdf/renderer");

  // ==============================================================
  // CARGAR FUENTES
  // ==============================================================

  const montserratRegular = buscarFuente([
    "Montserrat-Regular.ttf",
  ]);

  const montserratMedium = buscarFuente([
    "Montserrat-Medium.ttf",
  ]);

  const montserratBold = buscarFuente([
    "Montserrat-Bold.ttf",
  ]);

  const playfairBold = buscarFuente([
    "PlayfairDisplay-Bold.ttf",
  ]);

  // --------------------------------------------------------------
  // FUENTES FALLBACK
  // --------------------------------------------------------------

  let FONT_SANS = "Helvetica";

  let FONT_SANS_BOLD = "Helvetica-Bold";

  let FONT_SERIF = "Times-Bold";

  // --------------------------------------------------------------
  // MONTSERRAT REGULAR
  // --------------------------------------------------------------

  if (montserratRegular) {
    Font.register({
      family: "Montserrat",
      src: montserratRegular,
      fontWeight: 400,
    });

    FONT_SANS = "Montserrat";
  }

  // --------------------------------------------------------------
  // MONTSERRAT MEDIUM
  // --------------------------------------------------------------

  if (montserratMedium) {
    Font.register({
      family: "Montserrat",
      src: montserratMedium,
      fontWeight: 500,
    });
  }

  // --------------------------------------------------------------
  // MONTSERRAT BOLD
  // --------------------------------------------------------------

  if (montserratBold) {
    Font.register({
      family: "Montserrat",
      src: montserratBold,
      fontWeight: 700,
    });

    FONT_SANS_BOLD = "Montserrat";
  }

  // --------------------------------------------------------------
  // PLAYFAIR DISPLAY
  // --------------------------------------------------------------

  if (playfairBold) {
    Font.register({
      family: "PlayfairDisplay",
      src: playfairBold,
      fontWeight: 700,
    });

    FONT_SERIF = "PlayfairDisplay";
  }

  // ==============================================================
  // RECURSOS GRÁFICOS
  // ==============================================================

  const fondoSrc = FONDO?.src ?? null;

  const logoUnc = cargarLogo([
    "logo-unc.png",
    "logo_unc.png",
    "unc.png",
    "logo-universidad-nacional-de-cajamarca.png",
  ]);

  const logoWez = cargarLogo([
    "logo-wez.png",
    "logo_wez.png",
    "wez.png",
    "logo-wez-college.png",
  ]);

  // ==============================================================
  // DATOS NORMALIZADOS
  // ==============================================================

  const universidad =
    data.universidad?.trim() ||
    DEFAULTS.universidad;

  const facultad =
    data.facultad?.trim() ||
    DEFAULTS.facultad;

  const escuela =
    data.escuela?.trim() ||
    DEFAULTS.escuela;

  const nombrePrograma =
    data.nombrePrograma?.trim() ||
    DEFAULTS.programa;

  const codigoPrograma =
    data.codigoPrograma?.trim() ||
    DEFAULTS.codigoPrograma;

  const responsableUniversidad =
    data.responsableUniversidad?.trim() ||
    "Responsable académico";

  const cargoUniversidad =
    data.cargoUniversidad?.trim() ||
    "Universidad Nacional de Cajamarca";

  const responsableWez =
    data.responsableWez?.trim() ||
    "Responsable institucional";

  const cargoWez =
    data.cargoWez?.trim() ||
    DEFAULTS.institucionSede;

  // ==============================================================
  // ÁREA DE CONTENIDO
  // ==============================================================
  //
  // El lado izquierdo queda libre para aprovechar la composición
  // visual de la red neuronal del fondo.
  //
  // Contenido:
  //
  // X = 360
  // Ancho = 425
  //
  // Esto deja aproximadamente el 43% izquierdo para el arte.
  // ==============================================================

  const CONTENT_LEFT = 360;

  const CONTENT_WIDTH = 425;

  // ==============================================================
  // POSICIONES
  // ==============================================================

  const POS = {
    // ------------------------------------------------------------
    // LOGO UNC
    // ------------------------------------------------------------

    logoUnc: {
      left: 355,
      top: 30,
      width: 68,
      height: 68,
    },

    // ------------------------------------------------------------
    // LOGO WEZ
    // ------------------------------------------------------------

    logoWez: {
      left: 735,
      top: 30,
      width: 68,
      height: 68,
    },

    // ------------------------------------------------------------
    // ENCABEZADO
    // ------------------------------------------------------------

    encabezado: {
      left: CONTENT_LEFT,
      top: 30,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // TÍTULO
    // ------------------------------------------------------------

    titulo: {
      left: CONTENT_LEFT,
      top: 103,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // PROGRAMA
    // ------------------------------------------------------------

    programa: {
      left: CONTENT_LEFT,
      top: 182,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // OTORGADO
    // ------------------------------------------------------------

    otorgado: {
      left: CONTENT_LEFT,
      top: 244,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // NOMBRE
    // ------------------------------------------------------------

    nombre: {
      left: CONTENT_LEFT,
      top: 264,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // LÍNEA DEL NOMBRE
    // ------------------------------------------------------------

    lineaNombre: {
      left: 425,
      top: 316,
      width: 295,
    },

    // ------------------------------------------------------------
    // DESCRIPCIÓN
    // ------------------------------------------------------------

    descripcion: {
      left: CONTENT_LEFT,
      top: 329,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // ASISTENCIA
    // ------------------------------------------------------------

    asistencia: {
      left: CONTENT_LEFT,
      top: 402,
      width: CONTENT_WIDTH,
    },

    // ------------------------------------------------------------
    // FIRMA UNIVERSIDAD
    // ------------------------------------------------------------

    firmaUniversidad: {
      left: 360,
      top: 448,
      width: 195,
    },

    // ------------------------------------------------------------
    // FIRMA WEZ
    // ------------------------------------------------------------

    firmaWez: {
      left: 590,
      top: 448,
      width: 195,
    },

    // ------------------------------------------------------------
    // CÓDIGO
    // ------------------------------------------------------------

    codigo: {
      left: 355,
      top: 558,
      width: 430,
    },
  };

  // ==============================================================
  // ESTILOS
  // ==============================================================

  const styles = StyleSheet.create({
    // ------------------------------------------------------------
    // PÁGINA
    // ------------------------------------------------------------

    page: {
      width: PAGE_W,
      height: PAGE_H,

      position: "relative" as any,

      backgroundColor: COLORS.BACKGROUND,

      fontFamily: FONT_SANS,
    },

    // ------------------------------------------------------------
    // FONDO
    // ------------------------------------------------------------

    fondo: {
      position: "absolute" as any,

      left: 0,

      top: 0,

      width: PAGE_W,

      height: PAGE_H,
    },

    // ------------------------------------------------------------
    // POSICIONAMIENTO ABSOLUTO
    // ------------------------------------------------------------

    absolute: {
      position: "absolute" as any,
    },

    // ------------------------------------------------------------
    // LOGOS
    // ------------------------------------------------------------

    logoContainer: {
      position: "absolute" as any,
    },

    logo: {
      objectFit: "contain" as any,
    },

    // ============================================================
    // ENCABEZADO
    // ============================================================

    universidad: {
      fontFamily: FONT_SANS_BOLD,

      fontSize: 8.5,

      fontWeight: 700,

      color: COLORS.BRONZE,

      textAlign: "center" as any,

      letterSpacing: 1.1,
    },

    facultad: {
      marginTop: 4,

      fontFamily: FONT_SANS,

      fontSize: 6.7,

      fontWeight: 400,

      color: COLORS.LIGHT,

      textAlign: "center" as any,

      letterSpacing: 0.25,
    },

    // ============================================================
    // TÍTULO
    // ============================================================

    tituloPrincipal: {
      fontFamily: FONT_SERIF,

      fontSize: 28,

      fontWeight: 700,

      color: COLORS.WHITE,

      textAlign: "center" as any,

      letterSpacing: 4,
    },

    tituloSecundario: {
      marginTop: 3,

      fontFamily: FONT_SERIF,

      fontSize: 13,

      fontWeight: 700,

      color: COLORS.BRONZE,

      textAlign: "center" as any,

      letterSpacing: 2.4,
    },

    // ============================================================
    // PROGRAMA
    // ============================================================

    programaCodigo: {
      fontFamily: FONT_SANS_BOLD,

      fontSize: 7.5,

      fontWeight: 700,

      color: COLORS.BRONZE,

      textAlign: "center" as any,

      letterSpacing: 1,
    },

    programaNombre: {
      marginTop: 5,

      fontFamily: FONT_SANS_BOLD,

      fontSize: 10.2,

      fontWeight: 700,

      color: COLORS.WHITE,

      textAlign: "center" as any,

      lineHeight: 1.35,
    },

    // ============================================================
    // OTORGADO
    // ============================================================

    otorgado: {
      fontFamily: FONT_SANS,

      fontSize: 8,

      color: COLORS.MUTED,

      textAlign: "center" as any,

      letterSpacing: 0.8,
    },

    // ============================================================
    // NOMBRE
    // ============================================================

    nombre: {
      fontFamily: FONT_SERIF,

      fontSize: 21,

      fontWeight: 700,

      color: COLORS.BRONZE,

      textAlign: "center" as any,

      lineHeight: 1.15,
    },

    // ============================================================
    // LÍNEA DECORATIVA
    // ============================================================

    lineaNombre: {
      height: 1,

      backgroundColor: COLORS.BRONZE,
    },

    // ============================================================
    // DESCRIPCIÓN
    // ============================================================

    descripcion: {
      fontFamily: FONT_SANS,

      fontSize: 7.8,

      fontWeight: 400,

      color: COLORS.LIGHT,

      textAlign: "center" as any,

      lineHeight: 1.55,
    },

    // ============================================================
    // ASISTENCIA
    // ============================================================

    asistencia: {
      fontFamily: FONT_SANS_BOLD,

      fontSize: 9,

      fontWeight: 700,

      color: COLORS.WHITE,

      textAlign: "center" as any,

      letterSpacing: 0.8,
    },

    asistenciaNumero: {
      fontFamily: FONT_SANS_BOLD,

      fontSize: 11,

      fontWeight: 700,

      color: COLORS.BRONZE,
    },

    // ============================================================
    // FIRMAS
    // ============================================================

    firmaLinea: {
      width: 160,

      height: 1,

      backgroundColor: COLORS.BRONZE,

      alignSelf: "center" as any,

      marginBottom: 5,
    },

    firmaNombre: {
      fontFamily: FONT_SANS_BOLD,

      fontSize: 6.8,

      fontWeight: 700,

      color: COLORS.WHITE,

      textAlign: "center" as any,

      lineHeight: 1.2,
    },

    firmaCargo: {
      marginTop: 2,

      fontFamily: FONT_SANS,

      fontSize: 5.9,

      color: COLORS.MUTED,

      textAlign: "center" as any,

      lineHeight: 1.2,
    },

    // ============================================================
    // CÓDIGO DE VERIFICACIÓN
    // ============================================================

    codigo: {
      fontFamily: FONT_SANS,

      fontSize: 6.5,

      color: COLORS.MUTED,

      textAlign: "center" as any,

      letterSpacing: 0.3,
    },

    codigoStrong: {
      fontFamily: FONT_SANS_BOLD,

      fontWeight: 700,

      color: COLORS.BRONZE,
    },
  });

  // ==============================================================
  // HELPER PARA BLOQUES
  // ==============================================================

  const bloque = (
    left: number,
    top: number,
    width: number,
    contenido: any,
    key: string,
  ) => {
    return (
      <View
        key={key}
        style={[
          styles.absolute,
          {
            left,
            top,
            width,
          } as any,
        ]}
      >
        {contenido}
      </View>
    );
  };

  // ==============================================================
  // HELPER PARA LOGOS
  // ==============================================================

  const logoBloque = (
    src: string,
    pos: {
      left: number;
      top: number;
      width: number;
      height: number;
    },
    key: string,
  ) => {
    return (
      <View
        key={key}
        style={[
          styles.logoContainer,
          {
            left: pos.left,
            top: pos.top,
            width: pos.width,
            height: pos.height,
          } as any,
        ]}
      >
        <Image
          src={src as any}
          style={[
            styles.logo,
            {
              width: pos.width,
              height: pos.height,
            } as any,
          ]}
        />
      </View>
    );
  };

  // ==============================================================
  // DESCRIPCIÓN
  // ==============================================================

  const descripcion = (
    <>
      Por haber aprobado el programa de capacitación realizado
      los días{" "}
      <Text style={styles.codigoStrong}>
        {data.programaFechas}
      </Text>{" "}
      en la I.E.P. Wez College, alcanzando el porcentaje de
      asistencia exigido.
    </>
  );

  // ==============================================================
  // DOCUMENTO PDF
  // ==============================================================

  const doc = (
    <Document
      title={`Certificado - ${data.nombresApellidos}`}
      author="CDWC-IA"
      subject="Certificado de aprobación"
      keywords="certificado, CDWC-IA, inteligencia artificial, capacitación"
    >
      {/* ========================================================
          IMPORTANTE:
          
          NO usamos:
          
          orientation="landscape"
          
          porque la página ya está definida explícitamente como:
          
          842 × 595 pt
          
          Esto garantiza A4 horizontal.
          ======================================================== */}

      <Page
        size={{
          width: PAGE_W,
          height: PAGE_H,
        }}
        style={styles.page}
      >
        {/* ======================================================
            FONDO 3508 × 2480
            ====================================================== */}

        {fondoSrc ? (
          <Image
            src={fondoSrc as any}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PAGE_W,
              height: PAGE_H,
            } as any}
          />
        ) : (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: PAGE_W,
              height: PAGE_H,
              backgroundColor: COLORS.BACKGROUND,
            } as any}
          />
        )}

        {/* ======================================================
            LOGO UNIVERSIDAD
            ====================================================== */}

        {logoUnc &&
          logoBloque(
            logoUnc,
            POS.logoUnc,
            "logo-unc",
          )}

        {/* ======================================================
            LOGO WEZ
            ====================================================== */}

        {logoWez &&
          logoBloque(
            logoWez,
            POS.logoWez,
            "logo-wez",
          )}

        {/* ======================================================
            ENCABEZADO INSTITUCIONAL
            ====================================================== */}

        {bloque(
          POS.encabezado.left,
          POS.encabezado.top,
          POS.encabezado.width,
          <>
            <Text style={styles.universidad}>
              {universidad}
            </Text>

            <Text style={styles.facultad}>
              {facultad} · {escuela}
            </Text>
          </>,
          "encabezado",
        )}

        {/* ======================================================
            TÍTULO
            ====================================================== */}

        {bloque(
          POS.titulo.left,
          POS.titulo.top,
          POS.titulo.width,
          <>
            <Text style={styles.tituloPrincipal}>
              C E R T I F I C A D O
            </Text>

            <Text style={styles.tituloSecundario}>
              DE APROBACIÓN
            </Text>
          </>,
          "titulo",
        )}

        {/* ======================================================
            PROGRAMA
            ====================================================== */}

        {bloque(
          POS.programa.left,
          POS.programa.top,
          POS.programa.width,
          <>
            <Text style={styles.programaCodigo}>
              {codigoPrograma}
            </Text>

            <Text style={styles.programaNombre}>
              {nombrePrograma}
            </Text>
          </>,
          "programa",
        )}

        {/* ======================================================
            OTORGADO A
            ====================================================== */}

        {bloque(
          POS.otorgado.left,
          POS.otorgado.top,
          POS.otorgado.width,
          <Text style={styles.otorgado}>
            Otorgado a
          </Text>,
          "otorgado",
        )}

        {/* ======================================================
            NOMBRE DEL PARTICIPANTE
            ====================================================== */}

        {bloque(
          POS.nombre.left,
          POS.nombre.top,
          POS.nombre.width,
          <Text style={styles.nombre}>
            {data.nombresApellidos}
          </Text>,
          "nombre",
        )}

        {/* ======================================================
            LÍNEA DEBAJO DEL NOMBRE
            ====================================================== */}

        <View
          style={[
            styles.absolute,
            {
              left: POS.lineaNombre.left,
              top: POS.lineaNombre.top,
              width: POS.lineaNombre.width,
            } as any,
            styles.lineaNombre,
          ]}
        />

        {/* ======================================================
            DESCRIPCIÓN
            ====================================================== */}

        {bloque(
          POS.descripcion.left,
          POS.descripcion.top,
          POS.descripcion.width,
          <Text style={styles.descripcion}>
            {descripcion}
          </Text>,
          "descripcion",
        )}

        {/* ======================================================
            ASISTENCIA
            ====================================================== */}

        {bloque(
          POS.asistencia.left,
          POS.asistencia.top,
          POS.asistencia.width,
          <Text style={styles.asistencia}>
            ASISTENCIA{" "}
            <Text style={styles.asistenciaNumero}>
              {data.porcentaje}%
            </Text>
          </Text>,
          "asistencia",
        )}

        {/* ======================================================
            FIRMA UNIVERSIDAD
            ====================================================== */}

        {bloque(
          POS.firmaUniversidad.left,
          POS.firmaUniversidad.top,
          POS.firmaUniversidad.width,
          <>
            <View style={styles.firmaLinea} />

            <Text style={styles.firmaNombre}>
              {responsableUniversidad}
            </Text>

            <Text style={styles.firmaCargo}>
              {cargoUniversidad}
            </Text>
          </>,
          "firma-universidad",
        )}

        {/* ======================================================
            FIRMA WEZ COLLEGE
            ====================================================== */}

        {bloque(
          POS.firmaWez.left,
          POS.firmaWez.top,
          POS.firmaWez.width,
          <>
            <View style={styles.firmaLinea} />

            <Text style={styles.firmaNombre}>
              {responsableWez}
            </Text>

            <Text style={styles.firmaCargo}>
              {cargoWez}
            </Text>
          </>,
          "firma-wez",
        )}

        {/* ======================================================
            CÓDIGO DE VERIFICACIÓN
            ====================================================== */}

        {bloque(
          POS.codigo.left,
          POS.codigo.top,
          POS.codigo.width,
          <Text style={styles.codigo}>
            Código de verificación:{" "}
            <Text style={styles.codigoStrong}>
              {data.codigoVerificacion}
            </Text>

            {"   ·   "}

            {DEFAULTS.textoVerificacion}
          </Text>,
          "codigo-verificacion",
        )}
      </Page>
    </Document>
  ) as any;

  // ==============================================================
  // GENERAR BUFFER
  // ==============================================================

  const buffer: any = await renderToBuffer(
    doc as any,
  );

  // ==============================================================
  // DEVOLVER PDF
  // ==============================================================

  return Buffer.from(buffer);
}