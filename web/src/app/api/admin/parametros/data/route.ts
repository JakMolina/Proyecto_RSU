export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export async function GET() {
  if (!await getSession()) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { data } = await supabaseService().from("parametros").select("clave, valor");
  const obj: Record<string, string> = {};
  (data ?? []).forEach((r: any) => (obj[r.clave] = r.valor));
  return NextResponse.json(obj);
}
