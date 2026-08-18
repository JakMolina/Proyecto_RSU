"use client";
import { useState } from "react";

type ResultadoMasivo = {
  total: number;
  enviados: number;
  fallidos: number;
  omitidos: number;
  detalle_omitidos?: { id: string; motivo: string }[];
  detalle_envios?: { id: string; ok: boolean; error?: string }[];
};

export function MassEnvioWhatsapp() {
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<ResultadoMasivo | null>(null);
  const [err, setErr] = useState("");

  async function enviar() {
    if (!confirm(
      "Se enviarán todos los certificados con PDF disponible y WhatsApp válido.\n" +
      "Los ya enviados (ENVIADO) se omitirán; los FALLIDO se reintentarán.\n\n" +
      "Si WhatsApp Cloud API no está configurado, los envíos se registrarán como FALLIDO (sin enviar mensajes reales).\n\n" +
      "¿Confirmas el envío masivo?"
    )) return;
    setBusy(true);
    setErr("");
    setRes(null);
    const r = await fetch("/api/whatsapp/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todos: true }),
    });
    const d = await r.json();
    setBusy(false);
    if (r.ok) setRes(d as ResultadoMasivo);
    else setErr(d.error ?? "Error");
  }

  return (
    <div className="card flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Envío masivo por WhatsApp</h2>
          <p className="text-sm text-slate-600">
            Envía todos los certificados que <strong>tengan PDF disponible</strong> y WhatsApp válido,
            omitiendo los ya marcados como <code>ENVIADO</code> (los <code>FALLIDO</code> se reintentan).
          </p>
        </div>
        <button className="btn-primary whitespace-nowrap" onClick={enviar} disabled={busy}>
          {busy ? "Enviando…" : "Enviar certificados por WhatsApp"}
        </button>
      </div>

      {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {res && (
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Total candidatos</p>
            <p className="text-2xl font-bold">{res.total}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs text-emerald-600">Enviados</p>
            <p className="text-2xl font-bold text-emerald-700">{res.enviados}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs text-red-600">Fallidos</p>
            <p className="text-2xl font-bold text-red-700">{res.fallidos}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-3">
            <p className="text-xs text-amber-700">Omitidos</p>
            <p className="text-2xl font-bold text-amber-700">{res.omitidos}</p>
          </div>

          {res.detalle_omitidos?.length ? (
            <details className="sm:col-span-4">
              <summary className="cursor-pointer text-sm text-slate-500">
                Ver motivos de omisión ({res.detalle_omitidos.length})
              </summary>
              <ul className="mt-2 list-disc pl-6 text-xs text-slate-600">
                {res.detalle_omitidos.map((o) => (
                  <li key={o.id}>Certificado {o.id}: {o.motivo}</li>
                ))}
              </ul>
            </details>
          ) : null}

          {res.detalle_envios?.some((d) => !d.ok) ? (
            <details className="sm:col-span-4">
              <summary className="cursor-pointer text-sm text-slate-500">
                Ver motivos de fallo ({res.detalle_envios.filter((d) => !d.ok).length})
              </summary>
              <ul className="mt-2 list-disc pl-6 text-xs text-slate-600">
                {res.detalle_envios.filter((d) => !d.ok).map((d) => (
                  <li key={d.id}>Certificado {d.id}: {d.error ?? "error"}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      )}
    </div>
  );
}
