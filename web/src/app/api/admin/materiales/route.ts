export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

// Tamaño máximo: 20 MB
const MAX_BYTES = 20 * 1024 * 1024;

// Tipos MIME permitidos (defensa en profundidad; también validado por nombre/extensión).
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
]);

function sanitizeFilename(name: string): string {
  // Conserva extensión; elimina caracteres problemáticos para storage.
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^\.+/, "").slice(-120);
  return base || "archivo";
}

/** Subida de material (multipart/form-data). Solo admin. */
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Se esperaba multipart/form-data" }, { status: 400 });
  }

  const taller_id = String(form.get("taller_id") ?? "").trim();
  const nombreField = String(form.get("nombre") ?? "").trim();
  const descripcionField = String(form.get("descripcion") ?? "").trim();
  const file = form.get("file") as File | null;

  if (!taller_id) return NextResponse.json({ error: "taller_id requerido" }, { status: 422 });
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 422 });

  if (file.size === 0) return NextResponse.json({ error: "El archivo está vacío" }, { status: 422 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `El archivo supera el tamaño máximo de 20 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)` }, { status: 413 });
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: `Tipo de archivo no permitido: ${mime}` }, { status: 415 });
  }

  const sb = supabaseService();

  // Existe el taller?
  const { data: taller } = await sb.from("talleres").select("id").eq("id", taller_id).maybeSingle();
  if (!taller) return NextResponse.json({ error: "El taller indicado no existe" }, { status: 422 });

  const nombre = nombreField || file.name;
  const descripcion = descripcionField || null;
  const nombreArchivo = sanitizeFilename(file.name);

  // Primero creamos el registro para obtener un id estable; luego subimos
  // el archivo a storage usando ese id para evitar colisiones.
  const { data: mat, error: ie } = await sb.from("materiales").insert({
    taller_id,
    nombre,
    descripcion,
    nombre_archivo: nombreArchivo,
    mime_type: mime,
    bytes: file.size,
    storage_path: "__pending__",
  }).select("id").single();
  if (ie) return NextResponse.json({ error: ie.message }, { status: 500 });

  const storagePath = `${taller_id}/${mat.id}-${nombreArchivo}`;
  const arrayBuf = await file.arrayBuffer();
  const { error: upErr } = await sb.storage
    .from("materiales")
    .upload(storagePath, arrayBuf, { contentType: mime, upsert: false });
  if (upErr) {
    // Revertir el insert para no dejar filas huérfanas
    await sb.from("materiales").delete().eq("id", mat.id);
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  await sb.from("materiales").update({ storage_path: storagePath }).eq("id", mat.id);
  return NextResponse.json({ ok: true, id: mat.id, storage_path: storagePath });
}
