/**
 * Clientes Supabase (client + server) con paquete @supabase/ssr.
 * Estas funciones usan las variables NEXT_PUBLIC_SUPABASE_URL y
 * NEXT_PUBLIC_SUPABASE_ANON_KEY (client) y SUPABASE_SERVICE_ROLE_KEY
 * sólo en rutas de servidor/API.
 */
import { createBrowserClient } from "@supabase/ssr";
import {createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

/** ¿Están configured las variables de entorno de Supabase? */
export function supabaseConfigurado(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/** Cliente para el navegador (sin auth por defecto). */
export function supabaseBrowser(): SupabaseClient {
  return createBrowserClient(URL, ANON);
}

/** Cliente de servidor (server components / route handlers) con service role. */
export function supabaseService(): SupabaseClient {
  return createSupabaseClient(
    URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        fetch: (input, init = {}) => {
          return fetch(input, {
            ...init,
            cache: "no-store",
          });
        },
      },
    }
  );
}

/** Cliente anónimo en el servidor (lectura pública). */
export function supabaseAnon(): SupabaseClient {
  return createSupabaseClient(URL, ANON, { auth: { persistSession: false } });
}
