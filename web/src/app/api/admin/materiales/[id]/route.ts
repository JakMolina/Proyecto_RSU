export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

interface Params { params: { id: string } }

/** Elimina un material (registro en BD + archivo en Storage). Solo admin. */
export async function DELETE(_req: Request, { params }: Params) {
  if (!(await getSession())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const sb = supabaseService();
  const { data: mat } = await sb.from("materiales")
    .select("id, storage_path")
    .eq("id", params.id)
    .maybeSingle();
  if (!mat) return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });

  // Borra el objeto del bucket privado (tolerante si ya no existe)
  if (mat.storage_path) {
    await sb.storage.from("materiales").remove([mat.storage_path]).catch(() => {});
  }
  const { error } = await sb.from("materiales").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
