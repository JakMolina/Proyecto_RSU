import { cookies } from "next/headers";
import { supabaseAnon, supabaseService } from "./supabase";

export const SESSION_COOKIE = "cdwc_session";
export const DOCENTE_COOKIE = "cdwc_docente";

/** Lee el access_token desde la cookie y verifica que sea de un admin. */
export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data, error } = await supabaseAnon().auth.getUser(token);
  if (error || !data.user) return null;

  const { data: admin } = await supabaseService()
    .from("admins")
    .select("email")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) return null;

  return { userId: data.user.id, email: admin.email };
}

/** Lee la cookie del docente (sesión simple basada en DNI). */
export async function getDocente(): Promise<{
  id: string;
  dni: string;
  nombre: string;
} | null> {
  const raw = cookies().get(DOCENTE_COOKIE)?.value;
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    if (!d?.id || !d?.dni) return null;
    return { id: String(d.id), dni: String(d.dni), nombre: String(d.nombre ?? "") };
  } catch {
    return null;
  }
}

/** Verifica si un docente logueado coincide con un participante_id dado. */
export async function getDocenteById(participanteId: string) {
  const d = await getDocente();
  return d && d.id === participanteId ? d : null;
}
