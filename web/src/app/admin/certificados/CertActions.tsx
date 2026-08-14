"use client";
import { useState } from "react";

export function CertActions({ participanteId, certificadoId, codigoVerif, cumple }: { participanteId: string; certificadoId: string | null; codigoVerif: string | null; cumple: boolean }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function generar() {
    setBusy(true); setMsg("");
    const res = await fetch("/api/certificados/generar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participante_id: participanteId }),
    });
    const d = await res.json();
    setBusy(false);
    setMsg(res.ok ? "Certificado generado ✓" : d.error ?? "Error");
    if (res.ok) location.reload();
  }

  async function enviar() {
    if (!certificadoId) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/whatsapp/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificado_id: certificadoId }),
    });
    const d = await res.json();
    setBusy(false);
    setMsg(res.ok ? (d.fallidos ? `${d.enviados} OK, ${d.fallidos} fallidos` : "Enviado ✓") : d.error ?? "Error");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cumple && !certificadoId && (
        <button className="btn-primary" disabled={busy} onClick={generar}>Generar</button>
      )}
      {certificadoId && (
        <>
          <a className="btn-ghost" href={`/api/certificados/${codigoVerif}?download=1`} target="_blank" rel="noreferrer">Ver</a>
          <button className="btn-primary" disabled={busy} onClick={enviar}>WhatsApp</button>
        </>
      )}
      {msg && <span className="text-xs text-slate-500">{msg}</span>}
      {busy && <span className="text-xs text-slate-400">…</span>}
    </div>
  );
}
