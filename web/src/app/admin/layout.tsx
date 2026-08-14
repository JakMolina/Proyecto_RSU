"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, GraduationCap } from "lucide-react";
import { Sidebar, ADMIN_NAV } from "@/components/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");
  const [initials, setInitials] = useState<string>("AD");
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    fetch("/api/admin/me")
      .then(async (r) => {
        if (!r.ok) return { authed: false };
        return r.json();
      })
      .then((d) => {
        setAuthed(!!d.authed);
        if (d.email) setEmail(d.email);
        if (d.email) setInitials(d.email.slice(0, 2).toUpperCase());
        if (!d.authed) router.replace("/");
      });
  }, [router, isLogin]);

  // Cierra el drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // La página de login se renderiza sin sidebar (es pública)
  if (isLogin) return <>{children}</>;
  if (authed === null)
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Cargando…
      </div>
    );
  if (!authed) return null;

  async function logout() {
    await fetch("/api/admin/me", { method: "POST" });
    router.replace("/");
  }

  const user = { name: email || "Administrador", initials, role: "admin" as const };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar superior (solo móvil) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold text-slate-900">Wez College</span>
        </div>
        <button
          onClick={logout}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
          aria-label="Cerrar sesión"
        >
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Drawer móvil */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 transform shadow-xl transition-transform duration-300">
            <Sidebar items={ADMIN_NAV} brand={{ title: "Wez College", subtitle: "Cajamarca" }} user={user} onNavigate={() => setOpen(false)} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Sidebar fija (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white md:block">
        <Sidebar items={ADMIN_NAV} brand={{ title: "Wez College", subtitle: "Cajamarca" }} user={user} demoMode onLogout={logout} />
      </aside>

      {/* Contenido principal */}
      <div className="md:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
