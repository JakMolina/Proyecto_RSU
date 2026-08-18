"use client";
import { useEffect, useState } from "react";

type Docente = {
  id: string;
  dni: string;
  nombre_completo: string;
  whatsapp: string;
  creado_en: string;
};

type FormState = { dni: string; nombres: string; apellidos: string; whatsapp: string };

export default function AdminDocentesPage() {
  const [form, setForm] = useState<FormState>({ dni: "", nombres: "", apellidos: "", whatsapp: "" });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [listErr, setListErr] = useState("");

  async function cargar() {
    const res = await fetch("/api/admin/docentes");
    const d = await res.json();
    if (res.ok) setDocentes(d.docentes ?? []);
    else setListErr(d.error ?? "Error");
  }
  useEffect(() => {
    cargar();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/admin/docentes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Docente registrado correctamente. Ya puede iniciar sesión con su DNI." });
      setForm({ dni: "", nombres: "", apellidos: "", whatsapp: "" });
      cargar();
    } else {
      setMsg({ ok: false, text: d.error ?? "Error" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Registrar docente</h1>
        <p className="text-slate-600">
          Da de alta a un docente para que pueda iniciar sesión con su DNI y registrar su asistencia.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">DNI (8 dígitos)</label>
            <input
              className="input"
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              value={form.dni}
              onChange={(e) => setForm({ ...form, dni: e.target.value.replace(/\D/g, "").slice(0, 8) })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Número de WhatsApp</label>
            <input
              className="input"
              placeholder="+51 987654321"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombres</label>
            <input
              className="input"
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Apellidos</label>
            <input
              className="input"
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
              required
            />
          </div>
        </div>

        {msg && (
          <p
            className={`rounded-lg px-3 py-2 text-sm ${
              msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {msg.text}
          </p>
        )}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Registrando…" : "Registrar docente"}
        </button>
      </form>

      <div>
        <h2 className="mb-2 text-lg font-semibold">Docentes registrados</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">DNI</th>
                <th className="px-3 py-2">Docente</th>
                <th className="px-3 py-2">WhatsApp</th>
                <th className="px-3 py-2">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{p.dni}</td>
                  <td className="px-3 py-2">{p.nombre_completo}</td>
                  <td className="px-3 py-2">{p.whatsapp}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(p.creado_en).toLocaleString("es-PE")}
                  </td>
                </tr>
              ))}
              {!docentes.length && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={4}>
                    {listErr || "Sin docentes registrados todavía"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
