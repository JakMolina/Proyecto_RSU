export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface Params { params: { id: string } }

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

/** Elimina un material (registro en BD + archivo en Storage). Solo admin. */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await getSession())) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const sb = supabaseService();
  const { data: mat } = await sb.from("materiales")
    .select("id, storage_path")
    .eq("id", params.id)
    .maybeSingle();
  if (!mat) return noStore(NextResponse.json({ error: "Material no encontrado" }, { status: 404 }));

  // Borra el objeto del bucket privado (tolerante si ya no existe)
  if (mat.storage_path) {
    await sb.storage.from("materiales").remove([mat.storage_path]).catch(() => {});
  }
  const { error } = await sb.from("materiales").delete().eq("id", params.id);
  if (error) return noStore(NextResponse.json({ error: error.message }, { status: 500 }));
  return noStore(NextResponse.json({ ok: true }));
}
