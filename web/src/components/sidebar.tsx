"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  ScanLine,
  FileBarChart,
  Award,
  FolderOpen,
  Settings,
  LogOut,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  anchor?: string;
};

export type SidebarBrand = {
  title: string;
  subtitle: string;
};

export function isActivePath(pathname: string | null, href: string, exact?: boolean) {
  if (!pathname) return false;
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function BrandIcon({ className }: { className?: string }) {
  return <GraduationCap className={className} />;
}

function Avatar({ initials, role }: { initials: string; role: "admin" | "docente" }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white",
        role === "admin" ? "bg-slate-800" : "bg-brand-600"
      )}
    >
      {initials}
    </span>
  );
}

export function Sidebar({
  items,
  brand,
  user,
  demoMode = false,
  onNavigate,
  onLogout,
}: {
  items: SidebarItem[];
  brand: SidebarBrand;
  user: { name: string; initials: string; role: "admin" | "docente" };
  demoMode?: boolean;
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Cabecera */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm ring-2 ring-brand-100">
          <BrandIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">{brand.title}</p>
          <p className="text-xs text-slate-400">{brand.subtitle}</p>
        </div>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <Avatar initials={user.initials} role={user.role} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
          <p className="text-xs capitalize text-slate-400">{user.role === "admin" ? "Administrador" : "Docente"}</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {user.role === "admin" ? "Administración" : "Mi panel"}
        </p>
        {items.map((item) => {
          const active = isActivePath(pathname, item.href, item.exact);
          const Icon = item.icon;
          const fullHref = item.anchor ? `${item.href}${item.anchor}` : item.href;
          return (
            <Link
              key={item.label}
              href={fullHref}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn("h-[18px] w-[18px] shrink-0", active ? "text-brand-600" : "text-slate-400")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: cerrar sesión */}
      <div className="space-y-3 border-t border-slate-100 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-[18px] w-[18px] text-slate-400" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/* ===== Configuraciones preestablecidas ===== */

export const ADMIN_NAV: SidebarItem[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/participantes", label: "Participantes", icon: Users },
  { href: "/admin/escanear", label: "Asistencia", icon: ScanLine },
  { href: "/admin/asistencias", label: "Reportes", icon: FileBarChart },
  { href: "/admin/certificados", label: "Certificados", icon: Award },
  { href: "/admin/materiales", label: "Materiales", icon: FolderOpen },
  { href: "/admin/parametros", label: "Configuración", icon: Settings },
];

export const DOCENTE_NAV: SidebarItem[] = [
  { href: "/docente", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/docente", label: "Mi progreso", icon: FileBarChart, anchor: "#progreso" },
  { href: "/docente", label: "Mi certificado", icon: Award, anchor: "#certificado" },
  { href: "/docente", label: "Mis talleres", icon: FolderOpen, anchor: "#talleres" },
  { href: "/verificar", label: "Verificar certificado", icon: CheckCircle2 },
];
