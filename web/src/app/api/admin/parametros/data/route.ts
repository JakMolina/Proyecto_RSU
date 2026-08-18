export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  return res;
}

export async function GET() {
  if (!await getSession()) return noStore(NextResponse.json({ error: "No autorizado" }, { status: 401 }));
  const { data } = await supabaseService().from("parametros").select("clave, valor");
  const obj: Record<string, string> = {};
  (data ?? []).forEach((r: any) => (obj[r.clave] = r.valor));
  return noStore(NextResponse.json(obj));
}
