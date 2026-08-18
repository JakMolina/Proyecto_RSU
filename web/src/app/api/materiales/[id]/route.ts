export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession, getDocente } from "@/lib/auth";

interface Params { params: { id: string } }

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

/** Descarga de material: accesible para un docente autenticado o un admin.
 *  Lee desde el bucket PRIVADO "materiales" usando service_role (que salta
 *  RLS), sin exponer nunca el archivo públicamente. */
export async function GET(_req: Request, { params }: Params) {
  const [admin, docente] = await Promise.all([getSession(), getDocente()]);
  if (!admin && !docente) {
    return noStore(NextResponse.json({ error: "Acceso restringido. Inicia sesión." }, { status: 401 }));
  }

  const sb = supabaseService();
  const { data: mat, error } = await sb.from("materiales")
    .select("id, nombre_archivo, mime_type, bytes, storage_path, taller_id, talleres!inner(activo)")
    .eq("id", params.id)
    .maybeSingle() as any;

  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  if (!mat) return noStore(NextResponse.json({ error: "Material no encontrado" }, { status: 404 }));

  // Si el taller está desactivado, los docentes no pueden descargar; admin sí.
  if (!mat.talleres?.activo && !admin) {
    return noStore(NextResponse.json({ error: "Material no disponible" }, { status: 403 }));
  }

  const { data, error: dlErr } = await sb.storage.from("materiales").download(mat.storage_path);
  if (dlErr || !data) {
    return noStore(NextResponse.json({ error: "No se pudo recuperar el archivo" }, { status: 500 }));
  }

  const ab = await (data as Blob).arrayBuffer();
  const headers = new Headers({
    "Content-Type": mat.mime_type || "application/octet-stream",
    "Content-Length": String(mat.bytes ?? ab.byteLength),
    "Content-Disposition": `attachment; filename="${encodeURIComponent(mat.nombre_archivo)}"`,
    "Cache-Control": "private, no-store",
  });
  return new NextResponse(new Uint8Array(ab), { headers });
}
