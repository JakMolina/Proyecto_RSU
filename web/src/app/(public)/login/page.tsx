"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialRole = (sp.get("as") === "admin" ? "admin" : "docente") as "admin" | "docente";
  const [role, setRole] = useState<"admin" | "docente">(initialRole);

  // admin fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // docente fields
  const [dni, setDni] = useState("");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      if (role === "admin") {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const d = await res.json();
        if (!res.ok) {
          setErr(d.error ?? "Error");
          return;
        }
        router.push("/admin");
      } else {
        const res = await fetch("/api/docente/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dni }),
        });
        const d = await res.json();
        if (!res.ok) {
          setErr(d.error ?? "Error");
          return;
        }
        router.push("/docente");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Iniciar sesión</h1>
      <p className="mb-5 text-slate-600">Accede a tu cuenta para gestionar tu participación.</p>

      {/* Toggle de rol */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-slate-200 bg-white p-1">
        <button
          type="button"
          onClick={() => setRole("docente")}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            role === "docente" ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Soy docente
        </button>
        <button
          type="button"
          onClick={() => setRole("admin")}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            role === "admin" ? "bg-brand-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Soy administrador
        </button>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        {role === "admin" ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium">Correo institucional</label>
              <input className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Contraseña</label>
              <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium">DNI (8 dígitos)</label>
            <input
              className="input"
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
              required
            />
            <p className="mt-2 text-xs text-slate-500">¿Aún no te registras? <a className="text-brand-700 underline" href="/registro">Crear cuenta</a>.</p>
          </div>
        )}

        {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
