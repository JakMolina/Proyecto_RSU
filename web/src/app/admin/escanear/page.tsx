"use client";
import { useEffect, useRef, useState } from "react";
// @ts-ignore - sin tipos estrictas
import { Html5Qrcode } from "html5-qrcode";

type Sesion = {
  id: string;
  nombre: string;
  fecha: string;
};

export default function EscanearPage() {
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  const [sesionId, setSesionId] = useState<string>("");
  const [estado, setEstado] = useState<{ tipo: "idle" | "ok" | "error"; msg: string }>({ tipo: "idle", msg: "" });
  const [count, setCount] = useState<{ ok: number; dup: number; err: number }>({ ok: 0, dup: 0, err: 0 });
  const scannRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-reader";
  const sesionRef = useRef<string>("");

  useEffect(() => { sesionRef.current = sesionId; }, [sesionId]);

  useEffect(() => {
    fetch("/api/sesiones")
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setEstado({ tipo: "error", msg: "No se pudieron cargar las sesiones: " + (d.error ?? "error desconocido") });
          return;
        }
        setSesiones(d.sesiones ?? []);
        if (d.sesiones?.length) setSesionId(d.sesiones[0].id);
        else setEstado({ tipo: "error", msg: "Aún no hay sesiones creadas. Crea las sesiones del programa en Sesiones." });
      })
      .catch((e) => setEstado({ tipo: "error", msg: "Error de red al cargar sesiones: " + (e?.message ?? "") }));
  }, []);

  function detener() {
    if (scannRef.current) {
      scannRef.current.stop().catch(() => {});
      scannRef.current.clear();
      scannRef.current = null;
    }
  }

  async function iniciar() {
    if (!sesionId) {
      setEstado({ tipo: "error", msg: "Selecciona una sesión" });
      return;
    }
    setEstado({ tipo: "idle", msg: "" });
    const scanner = new Html5Qrcode(containerId, { verbose: false } as any);
    scannRef.current = scanner;
    const config = {
      fps: 10,
      qrbox: { width: 280, height: 120 },
      formatsToSupport: [
        "QR_CODE", "CODE_39", "CODE_128", "EAN_13", "PDF_417",
      ],
    } as any;

    try {
      await scanner.start(
        { facingMode: "environment" },
        config,
        async (decoded: string) => {
          // No detener: el admin escanea en lote. Solo pausa un toque.
          await registrar(decoded);
        },
        () => {}
      );
    } catch (e: any) {
      setEstado({ tipo: "error", msg: "No se pudo acceder a la cámara: " + (e?.message ?? "") });
    }
  }

  async function registrar(codigo: string) {
    const sid = sesionRef.current;
    if (!sid) {
      setEstado({ tipo: "error", msg: "Selecciona una sesión antes de escanear." });
      return;
    }
    setEstado({ tipo: "idle", msg: "Verificando…" });
    const res = await fetch("/api/asistencia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, sesion_id: sid }),
    });
    const data = await res.json();
    if (res.ok) {
      setEstado({ tipo: "ok", msg: `✓ ${data.nombre} — DNI ${data.dni}` });
      setCount((c) => ({ ...c, ok: c.ok + 1 }));
    } else if (data?.status === "duplicado") {
      setEstado({ tipo: "error", msg: `Ya registró: ${data.nombre ?? ""}` });
      setCount((c) => ({ ...c, dup: c.dup + 1 }));
    } else if (data?.status === "no_registrado" || res.status === 401) {
      setEstado({ tipo: "error", msg: data.error ?? "No autorizado" });
      setCount((c) => ({ ...c, err: c.err + 1 }));
    } else {
      setEstado({ tipo: "error", msg: data.error ?? "Error" });
      setCount((c) => ({ ...c, err: c.err + 1 }));
    }
  }

  useEffect(() => () => detener(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Escanear DNI · Registrar asistencia</h1>
          <p className="text-slate-600">Apunta la cámara al código de barras del DNI del docente durante la sesión.</p>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700">✓ {count.ok}</span>
          <span className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700">Duplicados: {count.dup}</span>
          <span className="rounded-lg bg-red-50 px-3 py-1.5 font-medium text-red-700">Errores: {count.err}</span>
        </div>
      </div>

      <div className="mx-auto max-w-md">
        <label className="mb-1 block text-sm font-medium">Sesión</label>
        <select className="input mb-4" value={sesionId} onChange={(e) => setSesionId(e.target.value)}>
          {sesiones.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} · {s.fecha}
            </option>
          ))}
        </select>

        <div className="card overflow-hidden p-3">
          <div id={containerId} className="min-h-[260px] w-full overflow-hidden rounded-lg bg-black" />
        </div>

        <div className="mt-4 flex gap-2">
          <button className="btn-primary flex-1" onClick={iniciar}>Iniciar escáner</button>
          <button className="btn-ghost" onClick={detener}>Detener</button>
        </div>

        {estado.msg && (
          <div
            className={`mt-4 rounded-lg px-3 py-2 text-sm ${
              estado.tipo === "ok" ? "bg-green-50 text-green-800" : estado.tipo === "error" ? "bg-red-50 text-red-800" : "bg-slate-100 text-slate-700"
            }`}
          >
            {estado.msg}
          </div>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-slate-500">¿No escanea? Ingresar DNI manualmente</summary>
          <InputManual onDni={(dni: string) => registrar(dni)} />
        </details>
      </div>
    </div>
  );
}

function InputManual({ onDni }: { onDni: (d: string) => void }) {
  const [d, setD] = useState("");
  return (
    <div className="mt-2 flex gap-2">
      <input className="input" inputMode="numeric" maxLength={8} placeholder="12345678" value={d} onChange={(e) => setD(e.target.value.replace(/\D/g, "").slice(0, 8))} />
      <button className="btn-primary" onClick={() => d.length === 8 && onDni(d)}>Registrar</button>
    </div>
  );
}
