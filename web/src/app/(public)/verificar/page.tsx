"use client";
import { useState } from "react";

type Cert = {
  codigo_verif: string;
  porcentaje: number;
  generado_en: string;
  nombre_completo: string;
  tiene_pdf: boolean;
  certificado_id: string;
};

export default function VerificarPage() {
  const [codigo, setCodigo] = useState("");
  const [data, setData] = useState<Cert | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function buscar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);
    const res = await fetch(`/api/certificados/${encodeURIComponent(codigo.trim())}`);
    const d = await res.json();
    if (res.ok) setData(d);
    else setError(d.error ?? "No encontrado");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Verificar certificado</h1>
      <p className="mb-4 text-slate-600">Ingresa el código de verificación del certificado.</p>
      <form onSubmit={buscar} className="flex gap-2">
        <input className="input" placeholder="Ej: A1B2C3D4E5F6" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
        <button className="btn-primary" disabled={loading}>Verificar</button>
      </form>

      {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-red-700">{error}</div>}

      {data && (
        <div className="card mt-4 p-5">
          <p className="text-sm text-slate-500">Participante</p>
          <p className="font-semibold">{data.nombre_completo}</p>
          <p className="mt-2 text-sm text-slate-500">Porcentaje de asistencia</p>
          <p className="font-semibold text-brand-700">{data.porcentaje}%</p>
          <p className="mt-2 text-sm text-slate-500">Código</p>
          <p className="font-mono">{data.codigo_verif}</p>
          {data.tiene_pdf && (
            <a className="btn-primary mt-4" href={`/api/certificados/${data.codigo_verif}?download=1`} target="_blank" rel="noreferrer">
              Descargar PDF
            </a>
          )}
        </div>
      )}
    </div>
  );
}
