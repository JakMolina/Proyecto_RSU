-- =====================================================================
-- CDWC-IA · Migración FASE 3 · Talleres + Materiales
-- =====================================================================
-- Idempotente: se puede ejecutar sobre un proyecto YA existente que
-- sólo tenga schema.sql aplicado, sin perder datos.
-- Pensado para ejecutarse EN SQL Editor de Supabase Studio.
-- =====================================================================

-- ---------- TALLERES ----------
create table if not exists public.talleres (
  id              uuid primary key default gen_random_uuid(),
  nombre          text        not null,
  descripcion     text,
  orden           int         not null default 1 check (orden >= 1),
  activo          boolean     not null default true,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);

-- Relación sesiones -> talleres (columna nullable, se backfillea abajo)
alter table public.sesiones
  add column if not exists taller_id uuid references public.talleres(id) on delete set null;

-- Relajar el check original "taller_numero between 1 and 4"
-- (la BD lo nombra automáticamente sesiones_taller_numero_check).
alter table public.sesiones drop constraint if exists sesiones_taller_numero_check;
alter table public.sesiones drop constraint if exists sesiones_taller_numero_chk;
alter table public.sesiones add constraint sesiones_taller_numero_chk check (taller_numero >= 1);

-- Trigger updated_at para talleres (usa la función existente del schema).
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end; $$;

drop trigger if exists trg_talleres_updated on public.talleres;
create trigger trg_talleres_updated before update on public.talleres
for each row execute function public.set_updated_at();

-- ---------- MATERIALES ----------
create table if not exists public.materiales (
  id              uuid primary key default gen_random_uuid(),
  taller_id       uuid not null references public.talleres(id) on delete cascade,
  nombre          text   not null,
  descripcion     text,
  nombre_archivo  text   not null,
  mime_type       text   not null,
  bytes           bigint not null,
  storage_path    text   not null,
  creado_en       timestamptz not null default now()
);
create index if not exists idx_materiales_taller on public.materiales(taller_id);

-- ---------- STORAGE: bucket PRIVADO para materiales ----------
insert into storage.buckets (id, name, public)
values ('materiales', 'materiales', false)
on conflict (id) do nothing;

-- ---------- Backfill inicial de los 4 talleres del programa ----------
-- Idempotente (guardado por orden).
insert into public.talleres (nombre, descripcion, orden)
select v.nombre, v.descripcion, v.orden
from (values
  (1, 'Introducción a la IA y Uso Ético en Educación',
      'Reconocimiento de imágenes, videos y textos generados por IA, riesgos, sesgos y uso responsable.'),
  (2, 'ChatGPT, Diseño de Prompts y Canva Magic Design',
      'Construcción de instrucciones efectivas y generación de recursos educativos.'),
  (3, 'Investigación Educativa con NotebookLM',
      'Organización del aprendizaje, validación de información y uso ético de fuentes.'),
  (4, 'Google Labs y Estrategias para el Uso Responsable',
      'Aplicaciones educativas de Flow y Flow Music, normas para el uso de IA.')
) as v(orden, nombre, descripcion)
where not exists (select 1 from public.talleres t where t.orden = v.orden);

-- Vincular sesiones existentes a talleres por taller_numero == orden
update public.sesiones s
set taller_id = t.id
from public.talleres t
where s.taller_id is null and s.taller_numero = t.orden;

-- ---------- RLS ----------
alter table public.talleres   enable row level security;
alter table public.materiales enable row level security;

create or replace function public.es_admin()
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.admins where id = auth.uid());
$$;

-- Talleres: lectura pública; escritura admin.
drop policy if exists pol_tal_select on public.talleres;
create policy pol_tal_select on public.talleres for select
  using (true);
drop policy if exists pol_tal_admin on public.talleres;
create policy pol_tal_admin on public.talleres for all
  using (public.es_admin()) with check (public.es_admin());

-- Materiales: SOLO admin (RLS); el docente descarga vía
-- /api/materiales/[id] (service_role en servidor).
drop policy if exists pol_mat_admin on public.materiales;
create policy pol_mat_admin on public.materiales for all
  using (public.es_admin()) with check (public.es_admin());

-- =====================================================================
-- FIN FASE 3
-- =====================================================================
