"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Taller = {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  sesion_nombre: string | null;
  sesion_fecha: string | null;
  materiales: number;
};

export default function AdminTalleresPage() {
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function cargar() {
    setLoading(true);
    const r = await fetch("/api/admin/talleres");
    const d = await r.json();
    if (r.ok) setTalleres(d.talleres ?? []);
    else setErr(d.error ?? "Error");
    setLoading(false);
  }
  useEffect(() => { cargar(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Talleres</h1>
        <p className="text-slate-600">
          Los talleres se crean <strong>dentro de una sesión</strong>.{" "}
          <Link href="/admin/sesiones" className="text-brand-700 underline">Ir a Sesiones para crearlos →</Link>
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Talleres registrados</h2>
        {loading ? (
          <p className="text-slate-500">Cargando…</p>
        ) : err ? (
          <p className="text-red-600">{err}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {talleres.map((t) => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Orden {t.orden}</p>
                    <Link href={`/admin/talleres/${t.id}`} className="text-base font-semibold text-slate-900 hover:underline">
                      {t.nombre}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Sesión: {t.sesion_nombre ? `${t.sesion_nombre} · ${t.sesion_fecha}` : "—"}
                    </p>
                  </div>
                  <span className={`badge ${t.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {t.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
                {t.descripcion && <p className="mt-1 text-sm text-slate-500">{t.descripcion}</p>}
                <p className="mt-2 text-xs text-slate-500">
                  {t.materiales} material(es) ·{" "}
                  <Link href={`/admin/talleres/${t.id}`} className="text-brand-700 underline">Ver detalle →</Link>
                </p>
              </div>
            ))}
            {!talleres.length && (
              <div className="card p-6 text-slate-500">
                Aún no hay talleres.{" "}
                <Link href="/admin/sesiones" className="text-brand-700 underline">Crea una sesión y añade talleres →</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
