import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CDWC-IA · Capacitación Docente en IA",
  description:
    "Sitio web del programa de capacitación Wez College sobre uso ético, responsable y pedagógico de la Inteligencia Artificial.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
