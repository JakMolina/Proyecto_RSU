"use client";
import { useEffect, useState } from "react";

export default function AdminParametrosPage() {
  const [umbral, setUmbral] = useState("75");
  const [mensaje, setMensaje] = useState("");
  const [fechas, setFechas] = useState("07 y 08 de julio de 2026");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/parametros/data").then((r) => r.json()).then((d) => {
      if (d.umbral_asistencia_min) setUmbral(d.umbral_asistencia_min);
      if (d.mensaje_whatsapp) setMensaje(d.mensaje_whatsapp);
      if (d.programa_fechas) setFechas(d.programa_fechas);
    });
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/admin/parametros", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ umbral_asistencia_min: umbral, mensaje_whatsapp: mensaje, programa_fechas: fechas }),
    });
    setMsg(res.ok ? "Guardado ✓" : "Error al guardar");
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Parámetros</h1>
      <form onSubmit={guardar} className="card space-y-3 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Umbral mínimo de asistencia (%)</label>
          <input className="input" type="number" min="0" max="100" value={umbral} onChange={(e) => setUmbral(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Fechas del programa (texto para certificado)</label>
          <input className="input" value={fechas} onChange={(e) => setFechas(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mensaje de WhatsApp</label>
          <textarea className="input min-h-[90px]" value={mensaje} onChange={(e) => setMensaje(e.target.value)} />
        </div>
        <button className="btn-primary">Guardar</button>
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
      </form>
    </div>
  );
}
