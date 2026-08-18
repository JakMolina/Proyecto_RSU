"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Taller = {
  id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
};

type SesionInfo = {
  id: string;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
} | null;

type Material = {
  id: string;
  nombre: string;
  descripcion: string | null;
  nombre_archivo: string;
  mime_type: string;
  bytes: number;
  storage_path: string;
  creado_en: string;
};

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function AdminTallerDetallePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [taller, setTaller] = useState<Taller | null>(null);
  const [sesion, setSesion] = useState<SesionInfo>(null);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function cargar() {
    setLoading(true);
    const r = await fetch(`/api/admin/talleres/${id}`);
    const d = await r.json();
    if (r.ok) {
      setTaller(d.taller);
      setSesion(d.sesion ?? null);
      setMateriales(d.materiales ?? []);
    } else {
      setErr(d.error ?? "Error");
    }
    setLoading(false);
  }
  useEffect(() => { if (id) cargar(); }, [id]);

  if (loading) return <p className="text-slate-500">Cargando…</p>;
  if (err) return <p className="text-red-600">{err}</p>;
  if (!taller) return <p className="text-slate-500">Taller no encontrado.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/sesiones" className="text-sm text-brand-700 underline">← Volver a sesiones</Link>
        <p className="mt-1 text-xs font-medium text-slate-400">Taller · orden {taller.orden}</p>
        <h1 className="text-2xl font-bold">{taller.nombre}</h1>
        {taller.descripcion && <p className="mt-1 text-slate-600">{taller.descripcion}</p>}
        <span className={`badge mt-2 inline-block ${taller.activo ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
          {taller.activo ? "Activo" : "Inactivo"}
        </span>
      </div>

      {sesion && (
        <div className="card p-4">
          <p className="text-xs font-medium text-slate-400">Pertenece a la sesión</p>
          <p className="font-semibold text-slate-900">{sesion.nombre}</p>
          <p className="text-sm text-slate-500">{sesion.fecha} · {sesion.hora_inicio}–{sesion.hora_fin}</p>
          <p className="mt-1 text-xs text-slate-500">
            La asistencia se toma por sesión desde{" "}
            <Link href="/admin/escanear" className="text-brand-700 underline">Escanear</Link>.
          </p>
        </div>
      )}

      <EditarTallerPanel taller={taller} onSaved={cargar} />

      <section>
        <h2 className="mb-2 text-lg font-semibold">Materiales del taller</h2>
        <UploadMaterialForm tallerId={taller.id} onUploaded={cargar} />
        <div className="card divide-y">
          {materiales.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{m.nombre}</p>
                <p className="truncate text-xs text-slate-500">
                  {m.nombre_archivo} · {fmtBytes(m.bytes)} · {m.mime_type}
                </p>
                {m.descripcion && <p className="mt-1 text-xs text-slate-500">{m.descripcion}</p>}
              </div>
              <div className="flex shrink-0 gap-2">
                <a className="btn-ghost" href={`/api/materiales/${m.id}`} target="_blank" rel="noreferrer">Descargar</a>
                <DeleteMaterial id={m.id} onDeleted={cargar} />
              </div>
            </div>
          ))}
          {!materiales.length && <p className="px-4 py-6 text-center text-slate-500">Sin materiales. Sube uno arriba.</p>}
        </div>
      </section>

      <section className="card border-red-200 p-5">
        <h2 className="text-lg font-semibold text-red-700">Zona peligrosa</h2>
        <p className="text-sm text-slate-600">
          Eliminar el taller <strong>borra sus materiales</strong>. La sesión y sus asistencias se conservan.
          Esta acción no se puede deshacer.
        </p>
        <DeleteTaller tallerId={taller.id} />
      </section>
    </div>
  );
}

function EditarTallerPanel({ taller, onSaved }: { taller: Taller; onSaved: () => void }) {
  const [nombre, setNombre] = useState(taller.nombre);
  const [descripcion, setDescripcion] = useState(taller.descripcion ?? "");
  const [orden, setOrden] = useState(String(taller.orden));
  const [activo, setActivo] = useState(taller.activo);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function patch(body: Record<string, any>) {
    setSaving(true);
    setMsg(null);
    const r = await fetch(`/api/admin/talleres/${taller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    setSaving(false);
    if (r.ok) { setMsg({ ok: true, text: "Guardado." }); onSaved(); }
    else { setMsg({ ok: false, text: d.error ?? "Error" }); }
  }

  async function guardarInfo() {
    await patch({ nombre, descripcion, orden: Number(orden) });
  }
  async function toggle() {
    const nuevo = !activo;
    setActivo(nuevo);
    await patch({ activo: nuevo });
  }

  return (
    <div className="card space-y-4 p-5">
      <h2 className="text-lg font-semibold">Editar taller</h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Orden</label>
          <input className="input" type="number" min={1} step={1} value={orden} onChange={(e) => setOrden(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Descripción</label>
        <textarea className="input" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" onClick={guardarInfo} disabled={saving}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <button
          className={activo ? "btn-ghost border border-red-200 text-red-700" : "btn-primary"}
          onClick={toggle}
          disabled={saving}
        >
          {activo ? "Desactivar taller" : "Activar taller"}
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</span>
        )}
      </div>
    </div>
  );
}

function UploadMaterialForm({ tallerId, onUploaded }: { tallerId: string; onUploaded: () => void }) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setMsg({ ok: false, text: "Elige un archivo." }); return; }
    setSaving(true);
    setMsg(null);

    const formData = new FormData();
    formData.append("taller_id", tallerId);
    formData.append("nombre", nombre || file.name);
    formData.append("descripcion", descripcion);
    formData.append("file", file);

    const r = await fetch("/api/admin/materiales", { method: "POST", body: formData });
    const d = await r.json();
    setSaving(false);
    if (r.ok) {
      setNombre(""); setDescripcion(""); setFile(null);
      if (inputFileRef.current) inputFileRef.current.value = "";
      setMsg({ ok: true, text: "Material subido." });
      onUploaded();
    } else {
      setMsg({ ok: false, text: d.error ?? "Error" });
    }
  }

  return (
    <form onSubmit={submit} className="card mb-3 space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Presentación del taller" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción (opcional)</label>
          <input className="input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Archivo</label>
        <input
          ref={inputFileRef}
          type="file"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-white"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip"
          required
        />
        <p className="mt-1 text-xs text-slate-500">PDF, imágenes, documentos Office, txt o zip · máx 20 MB.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Subiendo…" : "Subir material"}
        </button>
        {msg && (
          <span className={`text-sm ${msg.ok ? "text-green-700" : "text-red-700"}`}>{msg.text}</span>
        )}
      </div>
    </form>
  );
}

function DeleteMaterial({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!confirm("¿Eliminar este material? El archivo se borrará del almacenamiento.")) return;
    setBusy(true);
    await fetch(`/api/admin/materiales/${id}`, { method: "DELETE" });
    setBusy(false);
    onDeleted();
  }
  return (
    <button className="btn-ghost text-red-600" onClick={del} disabled={busy}>
      {busy ? "…" : "Eliminar"}
    </button>
  );
}

function DeleteTaller({ tallerId }: { tallerId: string }) {
  const [busy, setBusy] = useState(false);
  async function del() {
    if (!confirm("Se eliminarán los materiales del taller. ¿Continuar?")) return;
    setBusy(true);
    const r = await fetch(`/api/admin/talleres/${tallerId}`, { method: "DELETE" });
    setBusy(false);
    if (r.ok) {
      window.location.href = "/admin/talleres";
    } else {
      const d = await r.json();
      alert(d.error ?? "Error");
    }
  }
  return (
    <button className="btn-ghost mt-3 border border-red-300 text-red-700" onClick={del} disabled={busy}>
      {busy ? "Eliminando…" : "Eliminar taller"}
    </button>
  );
}
