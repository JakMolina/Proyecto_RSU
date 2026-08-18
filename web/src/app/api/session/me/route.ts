export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSession, getDocente } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

/** Devuelve el usuario actual (admin o docente) o null, para el header global. */
export async function GET() {
  const [admin, docente] = await Promise.all([getSession(), getDocente()]);
  if (admin) {
    const initials = admin.email!.slice(0, 2).toUpperCase();
    return noStore(NextResponse.json({
      role: "admin" as const,
      id: admin.userId,
      email: admin.email,
      initials,
    }));
  }
  if (docente) {
    const initials = docente.nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase() || docente.dni.slice(0, 2);
    return noStore(NextResponse.json({
      role: "docente" as const,
      id: docente.id,
      dni: docente.dni,
      nombre: docente.nombre,
      initials,
    }));
  }
  return noStore(NextResponse.json({ role: null }));
}
