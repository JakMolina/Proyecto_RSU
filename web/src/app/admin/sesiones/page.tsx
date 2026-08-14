"use client";
import { useEffect, useState } from "react";

type Sesion = {
  id: string;
  nombre: string;
  taller_numero: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export default function AdminSesionesPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [err, setErr] = useState("");

  async function cargar() {
    const r = await fetch("/api/sesiones");
    const d = await r.json();
    setSesiones(d.sesiones ?? []);
  }
  useEffect(() => { cargar(); }, []);

  async function crear(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch("/api/admin/sesiones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    if (res.ok) { (e.target as HTMLFormElement).reset(); cargar(); }
    else setErr(d.error ?? "Error");
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar sesión?")) return;
    await fetch(`/api/admin/sesiones?id=${id}`, { method: "DELETE" });
    cargar();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sesiones</h1>

      <form className="card grid gap-3 p-5 sm:grid-cols-5" onSubmit={crear}>
        <input className="input sm:col-span-2" name="nombre" placeholder="Nombre del taller" required />
        <select className="input" name="taller_numero" required defaultValue="1">
          {[1, 2, 3, 4].map((n) => <option key={n} value={n}>Taller {n}</option>)}
        </select>
        <input className="input" name="fecha" type="date" required />
        <div className="flex gap-2">
          <input className="input" name="hora_inicio" type="time" required />
          <input className="input" name="hora_fin" type="time" required />
        </div>
        <button className="btn-primary sm:col-span-5">Crear sesión</button>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </form>

      <div className="card divide-y">
        {sesiones.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <p className="font-medium">Taller {s.taller_numero}: {s.nombre}</p>
              <p className="text-slate-500">{s.fecha} · {s.hora_inicio} – {s.hora_fin}</p>
            </div>
            <button className="btn-ghost text-red-600" onClick={() => eliminar(s.id)}>Eliminar</button>
          </div>
        ))}
        {!sesiones.length && <p className="px-4 py-6 text-center text-slate-500">Sin sesiones</p>}
      </div>
    </div>
  );
}
