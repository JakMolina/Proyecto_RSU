import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        Universidad Nacional de Cajamarca · Proyecto CDWC-IA · 2026
      </footer>
    </>
  );
}
