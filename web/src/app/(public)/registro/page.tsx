"use client";
import { useState } from "react";

type State = { ok?: boolean; error?: string };

export default function RegistroPage() {
  const [form, setForm] = useState({ dni: "", nombres: "", apellidos: "", whatsapp: "" });
  const [state, setState] = useState<State>({});
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setState({});
    const res = await fetch("/api/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setState({ ok: true });
      setForm({ dni: "", nombres: "", apellidos: "", whatsapp: "" });
    } else {
      setState({ error: data.error ?? "Error" });
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Registro de docentes</h1>
      <p className="mb-4 text-slate-600">Completa tus datos para participar en el programa.</p>
      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">DNI</label>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Nombres</label>
            <input className="input" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Apellidos</label>
            <input className="input" value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Número de WhatsApp</label>
          <input className="input" placeholder="+51 987654321" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required />
        </div>

        {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
        {state.ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">¡Registro exitoso! Ya puedes registrar tu asistencia en cada sesión.</p>}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Registrando…" : "Registrarme"}
        </button>
      </form>
    </div>
  );
}
