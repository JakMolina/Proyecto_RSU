"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, GraduationCap } from "lucide-react";
import { Sidebar, DOCENTE_NAV } from "@/components/sidebar";

export default function DocenteLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; initials: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/session/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.role === "docente") {
          setUser({ name: d.nombre ?? "Docente", initials: d.initials ?? "DO" });
        } else {
          // No es docente: redirige al login
          router.replace("/login?as=docente");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Cierra el drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/docente/login", { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-500">
        Cargando…
      </div>
    );
  if (!user) return null;

  const sidebarUser = { name: user.name, initials: user.initials, role: "docente" as const };

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
            <Sidebar items={DOCENTE_NAV} brand={{ title: "Wez College", subtitle: "Cajamarca" }} user={sidebarUser} onNavigate={() => setOpen(false)} onLogout={logout} />
          </aside>
        </div>
      )}

      {/* Sidebar fija (escritorio) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white md:block">
        <Sidebar items={DOCENTE_NAV} brand={{ title: "Wez College", subtitle: "Cajamarca" }} user={sidebarUser} onLogout={logout} />
      </aside>

      {/* Contenido principal */}
      <div className="md:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
