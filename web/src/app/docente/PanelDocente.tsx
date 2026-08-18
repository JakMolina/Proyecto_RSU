"use client";
import Link from "next/link";
import { useState } from "react";

type TallerResumen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  sesiones_total: number;
  sesiones_asistidas: number;
  materiales?: number;
};
type Props = {
  docente: { dni: string; nombre: string };
  talleres: TallerResumen[];
  progreso: { total: number; asistidas: number; porcentaje: number; umbral: number; cumple: boolean };
  certificado: { codigo_verif: string; porcentaje: number; tiene_pdf: boolean } | null;
};

const TALLERES_INFO: Record<number, { emoji: string; color: string; tools: string }> = {
  1: { emoji: "🤖", color: "from-blue-500 to-blue-600", tools: "ChatGPT · Google Labs" },
  2: { emoji: "🎨", color: "from-purple-500 to-purple-600", tools: "ChatGPT · Canva Magic Design" },
  3: { emoji: "📚", color: "from-emerald-500 to-emerald-600", tools: "NotebookLM" },
  4: { emoji: "🎵", color: "from-amber-500 to-amber-600", tools: "Google Labs Flow · Flow Music" },
};

export function PanelDocente({ docente, talleres, progreso, certificado }: Props) {
  const [copied, setCopied] = useState(false);
  const firstName = docente.nombre.split(" ")[0] ?? docente.nombre;
  const sesionesRestantes = progreso.total - progreso.asistidas;

  function copiarCodigo() {
    if (!certificado) return;
    navigator.clipboard.writeText(certificado.codigo_verif).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Para el anillo circular
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progreso.porcentaje / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* HERO con gradiente + glass cards */}
      <section className="hero-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-lg md:p-12">
        {/* blobs decorativos */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="relative">
          <p className="mb-2 text-sm font-medium text-blue-200">Bienvenido a tu panel, docente</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hola, {firstName} 👋</h1>
          <p className="mt-2 max-w-lg text-blue-100">
            Aquí puedes ver tu progreso en el programa de capacitación y descargar tu certificado cuando esté disponible.
          </p>

          {/* glass row con stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-blue-100">Asistencias</p>
              <p className="text-2xl font-bold">{progreso.asistidas}<span className="text-base font-normal text-blue-200">/{progreso.total}</span></p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-blue-100">Porcentaje</p>
              <p className="text-2xl font-bold">{progreso.porcentaje}%</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-blue-100">Umbral mínimo</p>
              <p className="text-2xl font-bold">{progreso.umbral}%</p>
            </div>
            <div className="glass rounded-2xl p-4">
              <p className="text-xs text-blue-100">Estado</p>
              {progreso.cumple ? (
                <p className="text-lg font-bold text-emerald-300">Aprobado ✓</p>
              ) : (
                <p className="text-lg font-bold text-amber-300">En curso</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {certificado?.tiene_pdf && (
              <a
                href={`/api/certificados/${certificado.codigo_verif}?download=1`}
                target="_blank"
                rel="noreferrer"
                className="btn border border-white/40 text-white hover:bg-white/10"
              >
                Descargar mi PDF
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-5" id="progreso" style={{ scrollMarginTop: 80 }}>
        {/* Columna izquierda: progreso circular */}
        <section className="lg:col-span-2">
          <div className="card animate-fade-up p-6">
            <h2 className="text-lg font-bold text-slate-900">Mi progreso</h2>
            <p className="text-sm text-slate-500">Asistencia acumulada del programa</p>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative">
                <svg width="180" height="180" className="text-slate-100">
                  <circle cx="90" cy="90" r={radius} fill="none" stroke="currentColor" strokeWidth="12" />
                  <circle
                    className="progress-ring__circle"
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={progreso.cumple ? "#10b981" : "#1f6feb"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">{progreso.porcentaje}%</span>
                  <span className="text-xs text-slate-500">{progreso.asistidas} de {progreso.total}</span>
                </div>
              </div>

              <p className="mt-4 text-center text-sm text-slate-600">
                {progreso.cumple
                  ? "Has alcanzado el umbral mínimo. ¡Tu certificado está disponible!"
                  : `Te faltan ${Math.max(0, Math.ceil(((progreso.umbral - progreso.porcentaje) / 100) * progreso.total))} sesiones para certificar.`}
              </p>
            </div>
          </div>
        </section>

        {/* Columna derecha: certificado */}
        <section className="lg:col-span-3" id="certificado" style={{ scrollMarginTop: 80 }}>
          <div className="card animate-fade-up-delay-1 flex h-full flex-col p-6">
            <h2 className="text-lg font-bold text-slate-900">Mi certificado</h2>
            <p className="text-sm text-slate-500">Documento de aprobación del programa</p>

            {certificado?.tiene_pdf ? (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 p-6 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">¡Certificado generado!</h3>
                <p className="mt-1 text-sm text-slate-600">Tu certificado está listo para descargar.</p>
                <p className="mt-3 font-mono text-xs text-slate-500">Código: {certificado.codigo_verif}</p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={`/api/certificados/${certificado.codigo_verif}?download=1`}
                    className="btn-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    ⬇ Descargar PDF
                  </a>
                  <button onClick={copiarCodigo} className="btn-ghost">
                    {copied ? "✓ Copiado" : "Copiar código"}
                  </button>
                </div>
              </div>
            ) : progreso.cumple ? (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl bg-blue-50 p-6 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Cumpliste el umbral</h3>
                <p className="mt-1 text-sm text-slate-600">El administrador generará tu certificado y te llegará por WhatsApp.</p>
              </div>
            ) : (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-2xl bg-slate-50 p-6 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-4-7 4V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Aún no certificado</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Necesitas alcanzar el {progreso.umbral}% de asistencia. Actualmente tienes {progreso.porcentaje}%.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Mis talleres (cards reales, enlazan a /docente/talleres/[id]) */}
      <section id="talleres" style={{ scrollMarginTop: 80 }}>
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Mis talleres</h2>
          <Link href="/docente/talleres" className="text-sm font-medium text-brand-700 hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {talleres.map((t, i) => {
            const info = TALLERES_INFO[t.orden] ?? { emoji: "📘", color: "from-slate-400 to-slate-500", tools: "" };
            const pct = t.sesiones_total > 0 ? Math.round((t.sesiones_asistidas / t.sesiones_total) * 100) : 0;
            return (
              <Link
                key={t.id}
                href={`/docente/talleres/${t.id}`}
                className={`card animate-fade-up-delay-${Math.min(i, 3)} group overflow-hidden p-0 transition hover:shadow-md`}
              >
                <div className="flex">
                  <div className={`flex w-16 shrink-0 items-center justify-center bg-gradient-to-br ${info.color}`}>
                    <span className="text-3xl">{info.emoji}</span>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-medium text-slate-400">Taller {t.orden}</p>
                        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">{t.nombre}</h3>
                      </div>
                      <span className="badge bg-brand-50 text-brand-700">
                        {t.sesiones_asistidas}/{t.sesiones_total} sesión
                      </span>
                    </div>
                    {t.descripcion && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{t.descripcion}</p>
                    )}
                    <p className="mt-2 text-xs font-medium text-slate-500">
                      Sesión: {t.sesiones_asistidas ? "Asistió ✓" : "Pendiente"} · {t.materiales ?? 0} material(es)
                    </p>
                    <span className="mt-2 inline-block text-xs font-medium text-brand-700">
                      Ver materiales y detalle →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {!talleres.length && (
            <p className="text-slate-500">
              Aún no hay talleres publicados.{" "}
              <Link href="/docente/talleres" className="text-brand-700 underline">Ver talleres disponibles →</Link>
            </p>
          )}
        </div>
      </section>

      {/* Info del programa */}
      <section className="card animate-fade-up p-6">
        <h2 className="text-lg font-bold text-slate-900">Recursos del programa</h2>
        <p className="text-sm text-slate-500">Herramientas gratuitas que usamos en los talleres</p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { name: "ChatGPT", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
            { name: "Canva Magic Design", color: "bg-blue-50 text-blue-700 border-blue-200" },
            { name: "NotebookLM", color: "bg-amber-50 text-amber-700 border-amber-200" },
            { name: "Google Labs Flow", color: "bg-purple-50 text-purple-700 border-purple-200" },
          ].map((t) => (
            <div key={t.name} className={`rounded-xl border p-3 text-center text-sm font-medium ${t.color}`}>
              {t.name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
