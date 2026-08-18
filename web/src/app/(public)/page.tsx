import Link from "next/link";

const talleres = [
  {
    n: 1,
    dia: "Día 1",
    titulo: "Introducción a la IA y Uso Ético en Educación",
    detalle:
      "Reconocimiento de imágenes, videos y textos generados por IA, riesgos, sesgos y uso responsable.",
    tools: "ChatGPT · Google Labs (Flow y Flow Music)",
  },
  {
    n: 2,
    dia: "Día 1",
    titulo: "ChatGPT, Diseño de Prompts y Canva Magic Design",
    detalle: "Construcción de instrucciones efectivas y generación de recursos educativos.",
    tools: "ChatGPT · Canva Magic Design",
  },
  {
    n: 3,
    dia: "Día 2",
    titulo: "Investigación Educativa con NotebookLM",
    detalle: "Organización del aprendizaje, validación de información y uso ético de fuentes.",
    tools: "NotebookLM",
  },
  {
    n: 4,
    dia: "Día 2",
    titulo: "Google Labs y Estrategias para el Uso Responsable",
    detalle: "Aplicaciones educativas de Flow y Flow Music, normas para el uso de IA.",
    tools: "Google Labs Flow · Flow Music",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 p-10 text-white">
        <h1 className="text-3xl font-bold md:text-4xl">
          Capacitación a docentes en uso ético, responsable y pedagógico de la IA
        </h1>
        <p className="mt-3 max-w-2xl text-brand-50">
          Programa respaldado por un sitio web de control de asistencia por escaneo de DNI y
          certificación digital automática.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="btn bg-white text-brand-700 hover:bg-brand-50">Iniciar sesión</Link>
        </div>
        <p className="mt-4 text-sm text-brand-50">Sesiones: 07 y 08 de julio de 2026 · I.E.P. Wez College, Cajamarca – Perú</p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Programa formativo</h2>
        <p className="mb-4 text-slate-600">Cuatro talleres secuenciales, dos días.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {talleres.map((t) => (
            <div key={t.n} className="card p-5">
              <span className="badge bg-brand-100 text-brand-700">{`${t.dia} · Taller ${t.n}`}</span>
              <h3 className="mt-2 text-lg font-semibold">{t.titulo}</h3>
              <p className="mt-1 text-slate-600">{t.detalle}</p>
              <p className="mt-2 text-sm font-medium text-brand-700">Herramientas: {t.tools}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold">¿Cómo funciona el sitio web?</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-6 text-slate-700">
          <li>El administrador registra al docente (DNI y WhatsApp) en el panel de administración.</li>
          <li>El docente inicia sesión con su DNI y, en cada sesión, el administrador escanea el código de barras de su DNI.</li>
          <li>El sistema calcula el % de asistencia automáticamente.</li>
          <li>Si cumple, genera el certificado PDF y lo envía por WhatsApp.</li>
        </ol>
      </section>
    </div>
  );
}
