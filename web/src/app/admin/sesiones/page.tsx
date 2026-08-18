"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Sesion = {
  id: string;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  talleres: number;
};

type TallerLite = {
  id: string;
  nombre: string;
  orden: number;
  activo: boolean;
};

type SesionConTalleres = Sesion & { talleresLista: TallerLite[] };

export default function AdminSesionesPage() {
  const [sesiones, setSesiones] = useState<SesionConTalleres[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({ nombre: "", fecha: "", hora_inicio: "", hora_fin: "" });
  const [saving, setSaving] = useState(false);
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function cargar() {
    setLoading(true);
    const [sr, tr] = await Promise.all([
      fetch("/api/admin/sesiones").then((r) => r.json()),
      fetch("/api/admin/talleres").then((r) => r.json()),
    ]);
    if (sr.error) { setErr(sr.error); setLoading(false); return; }
    if (tr.error) { setErr(tr.error); setLoading(false); return; }
    const ses: Sesion[] = sr.sesiones ?? [];
    const tal: any[] = tr.talleres ?? [];
    const porSesion = new Map<string, TallerLite[]>();
    tal.forEach((t: any) => {
      const arr = porSesion.get(t.session_id) ?? [];
      arr.push({ id: t.id, nombre: t.nombre, orden: t.orden, activo: t.activo });
      porSesion.set(t.session_id, arr);
    });
    setSesiones(ses.map((s) => ({
      ...s,
      talleresLista: (porSesion.get(s.id) ?? []).sort((a, b) => a.orden - b.orden),
    })));
    setLoading(false);
  }
  useEffect(() => { cargar(); }, []);

  async function crearSesion(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormMsg(null);
    const r = await fetch("/api/admin/sesiones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await r.json();
    setSaving(false);
    if (r.ok) {
      setFormMsg({ ok: true, text: "Sesión creada." });
      setForm({ nombre: "", fecha: "", hora_inicio: "", hora_fin: "" });
      cargar();
    } else {
      setFormMsg({ ok: false, text: d.error ?? "Error" });
    }
  }

  async function eliminarSesion(id: string, nTalleres: number) {
    const msg = nTalleres > 0
      ? "Esta sesión tiene talleres. Al eliminar la sesión se borrarán sus talleres y materiales (las asistencias a la sesión se conservan). ¿Continuar?"
      : "Se eliminará la sesión. ¿Continuar?";
    if (!confirm(msg)) return;
    const r = await fetch(`/api/admin/sesiones?id=${id}`, { method: "DELETE" });
    if (r.ok) cargar();
    else { const d = await r.json(); alert(d.error ?? "Error"); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sesiones</h1>
        <p className="text-slate-600">
          Una <strong>sesión</strong> es el bloque temporal donde se toma asistencia. Dentro de cada sesión
          se crean los <strong>talleres</strong>, y en cada taller se suben los <strong>materiales</strong>.
        </p>
      </div>

      <form onSubmit={crearSesion} className="card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Crear sesión</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-1">
            <label className="mb-1 block text-sm font-medium">Nombre</label>
            <input className="input" value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required placeholder="Ej: Día 1 · Sesión de capacitación" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Fecha</label>
            <input className="input" type="date" value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hora inicio</label>
            <input className="input" type="time" value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Hora fin</label>
            <input className="input" type="time" value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })} required />
          </div>
        </div>
        {formMsg && (
          <p className={`rounded-lg px-3 py-2 text-sm ${formMsg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {formMsg.text}
          </p>
        )}
        <button className="btn-primary" disabled={saving}>
          {saving ? "Creando…" : "Crear sesión"}
        </button>
      </form>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : err ? (
        <p className="text-red-600">{err}</p>
      ) : (
        <div className="space-y-4">
          {sesiones.map((s) => (
            <SesionCard key={s.id} sesion={s} onDeleted={() => eliminarSesion(s.id, s.talleresLista.length)} onChanged={cargar} />
          ))}
          {!sesiones.length && (
            <div className="card p-8 text-center text-slate-500">
              Aún no hay sesiones. Crea la primera arriba.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SesionCard({
  sesion,
  onDeleted,
  onChanged,
}: {
  sesion: SesionConTalleres;
  onDeleted: () => void;
  onChanged: () => void;
}) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", orden: "1" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function crearTaller(e: React.FormEvent) {
    e.preventDefault();
    const nombre = form.nombre.trim();
    if (!nombre) return;
    setSaving(true);
    setMsg(null);
    const r = await fetch("/api/admin/talleres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sesion.id,
        nombre,
        descripcion: form.descripcion,
        orden: Number(form.orden),
      }),
    });
    const d = await r.json();
    setSaving(false);
    if (r.ok) {
      setMsg({ ok: true, text: "Taller creado." });
      setForm({ nombre: "", descripcion: "", orden: "1" });
      onChanged();
    } else {
      setMsg({ ok: false, text: d.error ?? "Error" });
    }
  }

  const fechaFmt = new Date(sesion.fecha + "T00:00").toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{sesion.nombre}</h2>
          <p className="text-sm text-slate-500">
            {fechaFmt} · {sesion.hora_inicio}–{sesion.hora_fin}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge bg-brand-50 text-brand-700">
            {sesion.talleresLista.length} taller(es)
          </span>
          <button className="btn-ghost text-red-600" onClick={onDeleted}>Eliminar sesión</button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <form onSubmit={crearTaller} className="lg:col-span-2 space-y-2 rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold">Crear taller en esta sesión</p>
          <input className="input" placeholder="Nombre del taller"
            value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <input className="input" placeholder="Descripción (opcional)"
            value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <div className="flex gap-2">
            <input className="input w-28" type="number" min={1} step={1} placeholder="Orden"
              value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} required />
            <button className="btn-primary flex-1" disabled={saving}>
              {saving ? "Creando…" : "Añadir taller"}
            </button>
          </div>
          {msg && (
            <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</p>
          )}
        </form>

        <div className="lg:col-span-3">
          <p className="mb-2 text-sm font-semibold text-slate-700">Talleres de la sesión</p>
          <div className="divide-y rounded-xl border border-slate-200">
            {sesion.talleresLista.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">
                    <span className="text-slate-400">Orden {t.orden}</span> · {t.nombre}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${t.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {t.activo ? "Activo" : "Inactivo"}
                  </span>
                  <Link href={`/admin/talleres/${t.id}`} className="text-brand-700 underline">
                    Ver detalle →
                  </Link>
                </div>
              </div>
            ))}
            {!sesion.talleresLista.length && (
              <p className="px-4 py-6 text-center text-slate-500">Sin talleres. Crea uno en el panel izquierdo.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
