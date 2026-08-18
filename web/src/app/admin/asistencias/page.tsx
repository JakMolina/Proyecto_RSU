"use client";
import { useEffect, useState } from "react";

type Sesion = { id: string; nombre: string; fecha: string };

type Row = {
  dni: string;
  participante: string;
  sesion: string;
  fecha: string;
  hora: string;
  talleres: string;
  registrado_en: string;
};

export default function AdminReportesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionId, setSesionId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/sesiones")
      .then((r) => r.json())
      .then((d) => setSesiones(d.sesiones ?? []));
  }, []);

  async function consultar() {
    setLoading(true);
    setErr("");
    const qs = new URLSearchParams();
    if (sesionId) qs.set("sesion_id", sesionId);
    const r = await fetch(`/api/admin/reportes?${qs.toString()}`);
    const d = await r.json();
    if (r.ok) setRows(d.rows ?? []);
    else setErr(d.error ?? "Error");
    setLoading(false);
  }

  useEffect(() => {
    void consultar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionId]);

  const csvHref = useMemoCsvHref(sesionId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reportes de asistencia</h1>
        <p className="text-slate-600">
          La asistencia se toma por <strong>sesión</strong>. Filtra por sesión; el CSV respeta exactamente el filtro seleccionado.
        </p>
      </div>

      <div className="card grid gap-3 p-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-sm font-medium">Sesión</label>
          <select className="input" value={sesionId} onChange={(e) => setSesionId(e.target.value)}>
            <option value="">Todas las sesiones</option>
            {sesiones.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre} · {s.fecha}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end sm:col-span-2 sm:justify-end">
          <a className="btn-primary" href={csvHref}>Exportar CSV</a>
        </div>
      </div>

      {err && <div className="rounded-lg bg-red-50 px-3 py-2 text-red-700">{err}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-3 py-2">DNI</th>
              <th className="px-3 py-2">Participante</th>
              <th className="px-3 py-2">Sesión</th>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Hora</th>
              <th className="px-3 py-2">Talleres de la sesión</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Cargando…</td></tr>
            ) : rows.length ? (
              rows.map((r, i) => (
                <tr key={`${r.dni}-${r.sesion}-${i}`} className="border-t">
                  <td className="px-3 py-2 font-mono">{r.dni}</td>
                  <td className="px-3 py-2">{r.participante}</td>
                  <td className="px-3 py-2">{r.sesion}</td>
                  <td className="px-3 py-2">{r.fecha}</td>
                  <td className="px-3 py-2">{r.hora}</td>
                  <td className="px-3 py-2 text-slate-600">{r.talleres}</td>
                </tr>
              ))
            ) : (
              <tr><td className="px-3 py-6 text-center text-slate-500" colSpan={6}>Sin registros para el filtro seleccionado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-slate-500">Total: {rows.length} asistencia(s)</p>
    </div>
  );
}

function useMemoCsvHref(sesionId: string): string {
  return `/api/export/asistencia?sesion_id=${encodeURIComponent(sesionId)}`;
}
