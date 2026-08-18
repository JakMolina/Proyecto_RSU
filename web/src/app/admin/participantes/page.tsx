"use client";
import { useEffect, useState } from "react";

type Participante = {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  whatsapp: string;
  creado_en: string;
};

type FormState = { id: string | null; dni: string; nombres: string; apellidos: string; whatsapp: string };
const EMPTY: FormState = { id: null, dni: "", nombres: "", apellidos: "", whatsapp: "" };

export default function AdminParticipantesPage() {
  const [lista, setLista] = useState<Participante[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [listErr, setListErr] = useState("");
  const [search, setSearch] = useState("");

  async function cargar() {
    const r = await fetch("/api/admin/participantes");
    const d = await r.json();
    if (r.ok) setLista(d.participantes ?? []);
    else setListErr(d.error ?? "Error");
  }
  useEffect(() => { cargar(); }, []);

  function editar(p: Participante) {
    setForm({ id: p.id, dni: p.dni, nombres: p.nombres, apellidos: p.apellidos, whatsapp: p.whatsapp });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelar() {
    setForm(EMPTY);
    setMsg(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const isEdit = !!form.id;
    const url = isEdit ? "/api/admin/participantes" : "/api/admin/participantes";
    const method = isEdit ? "PATCH" : "POST";
    const body: any = { dni: form.dni, nombres: form.nombres, apellidos: form.apellidos, whatsapp: form.whatsapp };
    if (isEdit) body.id = form.id;

    const r = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setSaving(false);
    if (r.ok) {
      setMsg({ ok: true, text: isEdit ? "Participante actualizado." : "Participante registrado correctamente." });
      setForm(EMPTY);
      cargar();
    } else {
      setMsg({ ok: false, text: d.error ?? "Error" });
    }
  }

  async function eliminar(p: Participante) {
    if (!confirm(`¿Eliminar a ${p.nombre_completo} (DNI ${p.dni})? Se borrarán también sus asistencias y certificados.`)) return;
    const r = await fetch(`/api/admin/participantes?id=${p.id}`, { method: "DELETE" });
    if (r.ok) cargar();
    else { const d = await r.json(); alert(d.error ?? "Error"); }
  }

  const filtrados = lista.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.dni.includes(q) ||
      p.nombre_completo.toLowerCase().includes(q) ||
      p.whatsapp.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Participantes</h1>
        <p className="text-slate-600">
          Crea, edita y elimina docentes del programa. Cada participante se registra con DNI, nombres, apellidos y WhatsApp.
        </p>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{form.id ? "Editar participante" : "Registrar nuevo participante"}</h2>
          {form.id && (
            <button type="button" className="btn-ghost text-sm" onClick={cancelar}>Cancelar edición</button>
          )}
        </div>
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
            <input className="input" value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Apellidos</label>
            <input className="input" value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })} required />
          </div>
        </div>

        {msg && (
          <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {msg.text}
          </p>
        )}

        <button className="btn-primary w-full sm:w-auto" disabled={saving}>
          {saving ? "Guardando…" : form.id ? "Guardar cambios" : "Registrar participante"}
        </button>
      </form>

      <div>
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-lg font-semibold">Participantes registrados ({lista.length})</h2>
          <input
            className="input max-w-xs"
            placeholder="Buscar por DNI, nombre o WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-3 py-2">DNI</th>
                <th className="px-3 py-2">Participante</th>
                <th className="px-3 py-2">WhatsApp</th>
                <th className="px-3 py-2">Registrado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{p.dni}</td>
                  <td className="px-3 py-2">{p.nombre_completo}</td>
                  <td className="px-3 py-2">{p.whatsapp}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {new Date(p.creado_en).toLocaleString("es-PE")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button className="btn-ghost mr-1 text-brand-700" onClick={() => editar(p)}>Editar</button>
                    <button className="btn-ghost text-red-600" onClick={() => eliminar(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {!filtrados.length && (
                <tr>
                  <td className="px-3 py-6 text-center text-slate-500" colSpan={5}>
                    {listErr || (search ? "Sin coincidencias" : "Sin participantes todavía")}
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
