-- =====================================================================
-- CDWC-IA · Migración FASE 4 · INVERTIR JERARQUÍA: Sesiones -> Talleres
-- =====================================================================
-- ANTES (FASE 3):  Taller --tiene--> Sesiones   (sesiones.taller_id)
-- AHORA (FASE 4):  Sesión --tiene--> Talleres   (talleres.session_id)
--
-- La asistencia se toma por SESIÓN (no por taller).
-- Los materiales siguen perteneciendo al TALLER (sin cambios).
--
-- IDEMPOTENTE: se puede ejecutar cuantas veces quieras en SQL Editor
-- de Supabase Studio. NO borra datos existentes: migra la relación.
-- =====================================================================

-- ---------- 1) Añadir talleres.session_id ----------
alter table public.talleres
  add column if not exists session_id uuid references public.sesiones(id) on delete cascade;

create index if not exists idx_talleres_session on public.talleres(session_id);

-- ---------- 2) Migrar la relación existente ----------
-- Cada sesión que apuntaba a un taller (sesiones.taller_id) ahora se
-- invierte: ese taller pasa a pertenecer a esa sesión.
update public.talleres t
  set session_id = s.id
  from public.sesiones s
  where t.session_id is null and s.taller_id = t.id;

-- ---------- 3) Relajar sesiones ----------
-- La columna sesiones.taller_id ya no se usa (la relación está al revés).
-- No la borramos por si hay vistas/código viejo, pero quitamos la FK
-- y la dejamos nullable para no romper nada.
alter table public.sesiones
  drop constraint if exists sesiones_taller_id_fkey;

-- El check de taller_numero ya no aplica (se conservó por compatibilidad
-- en FASE 3). Lo relajamos y permitimos nulo para nuevas sesiones.
alter table public.sesiones drop constraint if exists sesiones_taller_numero_check;
alter table public.sesiones drop constraint if exists sesiones_taller_numero_chk;
alter table public.sesiones alter column taller_numero drop not null;

-- ---------- 4) RLS: ya existe para sesiones y talleres, sin cambios ----------
-- (pol_ses_select pública, pol_ses_admin admin; pol_tal_select pública,
--  pol_tal_admin admin). Sólo aseguramos que talleres.session_id quede
--  cubierto por la política existente "for all" del admin.

-- =====================================================================
-- FIN FASE 4
-- =====================================================================
