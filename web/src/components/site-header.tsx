"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type SessionUser = {
  role: "admin" | "docente" | null;
  id?: string;
  email?: string;
  nombre?: string;
  initials?: string;
};

const PUBLIC_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/registro", label: "Registrarme" },
  { href: "/verificar", label: "Verificar certificado" },
];

function isActive(pathname: string | null, href: string, exact = false) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session/me")
      .then((r) => r.json())
      .then((d) => setUser(d))
      .finally(() => setLoading(false));
  }, [pathname]);

  async function logout() {
    if (user?.role === "admin") {
      await fetch("/api/admin/me", { method: "POST" });
    } else if (user?.role === "docente") {
      await fetch("/api/docente/login", { method: "DELETE" });
    }
    setUser(null);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const adminLink = { href: "/admin", label: "Panel Admin" };
  const docenteLink = { href: "/docente", label: "Mi panel" };

  // "Registrarme" solo es visible para visitantes anónimos:
  // un docente ya logueado ya está registrado, y el admin no se registra aquí.
  const baseLinks = user?.role ? PUBLIC_LINKS.filter((l) => l.href !== "/registro") : PUBLIC_LINKS;

  const links = [
    ...baseLinks,
    ...(user?.role === "admin" ? [adminLink] : []),
    ...(user?.role === "docente" ? [docenteLink] : []),
  ];

  const navLinkClass = (href: string) =>
    cn(
      "rounded-md px-3 py-1.5 text-sm font-medium transition",
      isActive(pathname, href, href === "/")
        ? "bg-brand-100 text-brand-700 shadow-sm ring-1 ring-brand-200"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    );

  const mobileLinkClass = (href: string) =>
    cn(
      "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition",
      isActive(pathname, href, href === "/")
        ? "bg-brand-100 text-brand-700 ring-1 ring-brand-200"
        : "text-slate-600 hover:bg-slate-100"
    );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="rounded-lg bg-brand-600 px-2 py-1 text-xs font-bold text-white">CDWC-IA</span>
          <span className="hidden font-semibold text-slate-800 sm:inline">Capacitación Docente en IA · Wez College</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass(l.href)}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Avatar / login */}
        <div className="flex items-center gap-2">
          {!loading && !user?.role && (
            <Link href="/login" className="btn-primary text-sm">
              Iniciar sesión
            </Link>
          )}

          {user?.role && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 transition hover:bg-slate-50"
                aria-label="Menú de usuario"
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white",
                    user.role === "admin" ? "bg-slate-800" : "bg-brand-600"
                  )}
                >
                  {user.initials ?? "?"}
                </span>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:inline">
                  {user.role === "admin" ? user.email : user.nombre}
                </span>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-2">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {user.role === "admin" ? "Administrador" : "Docente"}
                      </p>
                      <p className="truncate text-sm font-medium text-slate-700">
                        {user.role === "admin" ? user.email : user.nombre}
                      </p>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Panel admin
                      </Link>
                    )}
                    {user.role === "docente" && (
                      <Link
                        href="/docente"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        Mi panel
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Nav móvil */}
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 bg-white px-4 py-2 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={mobileLinkClass(l.href)}>
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
