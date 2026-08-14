"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pwd }),
    });
    const d = await res.json();
    setLoading(false);
    if (res.ok) router.push("/admin");
    else setErr(d.error ?? "Error");
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Acceso administrativo</h1>
      <form onSubmit={submit} className="card mt-4 space-y-3 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Correo</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Contraseña</label>
          <input className="input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required />
        </div>
        {err && <p className="rounded bg-red-50 px-2 py-1 text-sm text-red-700">{err}</p>}
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
        <p className="text-xs text-slate-500">Crea el usuario admin en Supabase Auth y regístralo en la tabla <code>admins</code>.</p>
      </form>
    </div>
  );
}
