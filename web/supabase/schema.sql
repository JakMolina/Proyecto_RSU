-- =====================================================================
-- CDWC-IA · Esquema Supabase (PostgreSQL) · Plan Free
-- =====================================================================
-- Ejecutar en: Supabase Studio → SQL Editor
-- =====================================================================

-- ---------- Extensiones ----------
create extension if not exists "pgcrypto";

-- =====================================================================
-- TABLAS
-- =====================================================================

-- ---------- PARTICIPANTES ----------
-- CHECKs de formato: defensa en profundidad (la app ya valida en /api/registro,
-- pero si algo se salta la API la BD también rechaza).
create table if not exists public.participantes (
  id              uuid primary key default gen_random_uuid(),
  dni             varchar(8)   not null unique
                    check (dni ~ '^[0-9]{8}$'),
  nombres         text         not null,
  apellidos       text         not null,
  nombre_completo text generated always as (nombres || ' ' || apellidos) stored,
  whatsapp        varchar(20)  not null
                    check (whatsapp ~ '^\+?[0-9 ]{8,20}$'),
  creado_en       timestamptz  not null default now(),
  actualizado_en  timestamptz  not null default now()
);

-- ---------- SESIONES ----------
create table if not exists public.sesiones (
  id           uuid primary key default gen_random_uuid(),
  nombre        text         not null,
  taller_numero int          not null check (taller_numero between 1 and 4),
  fecha        date         not null,
  hora_inicio  time         not null,
  hora_fin     time         not null,
  creada_en    timestamptz  not null default now()
);

-- ---------- ASISTENCIAS ----------
create table if not exists public.asistencias (
  id            uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  sesion_id       uuid not null references public.sesiones(id)     on delete cascade,
  registrado_en   timestamptz not null default now(),
  unique (participante_id, sesion_id)
);
create index if not exists idx_asistencias_participante on public.asistencias(participante_id);
create index if not exists idx_asistencias_sesion       on public.asistencias(sesion_id);

-- ---------- CERTIFICADOS ----------
create table if not exists public.certificados (
  id              uuid primary key default gen_random_uuid(),
  participante_id uuid not null references public.participantes(id) on delete cascade,
  codigo_verif    text not null unique default upper(substr(encode(gen_random_bytes(6),'hex'),1,12)),
  porcentaje      numeric(5,2) not null,
  generado_en     timestamptz not null default now(),
  storage_path    text,
  unique (participante_id)
);

-- ---------- ENVÍOS WHATSAPP ----------
create table if not exists public.envios_whatsapp (
  id             uuid primary key default gen_random_uuid(),
  certificado_id uuid not null references public.certificados(id) on delete cascade,
  estado         varchar(10) not null default 'PENDIENTE' check (estado in ('PENDIENTE','ENVIADO','FALLIDO')),
  intentos       int  not null default 0,
  respuesta_api  text,
  enviado_en     timestamptz,
  creado_en      timestamptz not null default now()
);

-- ---------- PARÁMETROS (config admin) ----------
create table if not exists public.parametros (
  clave        varchar(40) primary key,
  valor        text not null,
  actualizado  timestamptz not null default now()
);
insert into public.parametros (clave, valor) values
  ('umbral_asistencia_min', '75'),
  ('mensaje_whatsapp', 'Estimado/a docente, adjuntamos su certificado digital del programa CDWC-IA. Universidad Nacional de Cajamarca - I.E.P. Wez College.'),
  ('programa_fechas', '07 y 08 de julio de 2026')
on conflict (clave) do nothing;

-- ---------- PERFIL ADMIN (vincula auth.users) ----------
create table if not exists public.admins (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  creado_en   timestamptz not null default now()
);

-- =====================================================================
-- TRIGGERS: updated_at
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.actualizado_en = now(); return new; end; $$;

drop trigger if exists trg_participantes_updated on public.participantes;
create trigger trg_participantes_updated before update on public.participantes
for each row execute function public.set_updated_at();

drop trigger if exists trg_parametros_updated on public.parametros;
create trigger trg_parametros_updated before update on public.parametros
for each row execute function public.set_updated_at();

-- =====================================================================
-- FUNCIÓN: cálculo de porcentaje de asistencia
-- =====================================================================
create or replace function public.calcular_porcentaje_asistencia(p_participante uuid)
returns numeric as $$
declare
  total_sesiones int;
  asistencias    int;
begin
  select count(*) into total_sesiones from public.sesiones;
  if total_sesiones = 0 then return 0; end if;
  select count(*) into asistencias
    from public.asistencias
   where participante_id = p_participante;
  return round((asistencias::numeric / total_sesiones) * 100, 2);
end;
$$ language plpgsql stable;

-- =====================================================================
-- TRIGGER: impedir certificado a quien no cumple el umbral de asistencia
-- (defensa en profundidad: aunque se salte la validación de /api/certificados/generar,
-- la BD rechaza el INSERT con raise exception).
-- =====================================================================
create or replace function public.validar_certificado_antes_insert()
returns trigger language plpgsql as $$
declare
  pct numeric;
  umbral numeric;
begin
  pct := public.calcular_porcentaje_asistencia(new.participante_id);
  select valor::numeric into umbral
    from public.parametros
   where clave = 'umbral_asistencia_min';
  if umbral is null then umbral := 75; end if;
  if pct < umbral then
    raise exception 'No alcanza el umbral de asistencia (% < %)', pct, umbral
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_cert_valida_umbral on public.certificados;
create trigger trg_cert_valida_umbral before insert or update on public.certificados
for each row execute function public.validar_certificado_antes_insert();

-- =====================================================================
-- STORAGE: bucket para certificados PDF
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('certificados', 'certificados', true)
on conflict (id) do nothing;

-- =====================================================================
-- RLS (Row Level Security)
-- =====================================================================
alter table public.participantes   enable row level security;
alter table public.sesiones        enable row level security;
alter table public.asistencias     enable row level security;
alter table public.certificados    enable row level security;
alter table public.envios_whatsapp enable row level security;
alter table public.parametros      enable row level security;
alter table public.admins          enable row level security;

-- Helper: ¿es administrador?
create or replace function public.es_admin()
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.admins where id = auth.uid());
$$;

-- Participantes: SOLO admin (SELECT/UPDATE/DELETE); la inserción
-- se hace vía /api/registro (que usa service_role, salta RLS).
-- Eliminamos el INSERT público anónimo para impedir inyección de PII
-- o creación masiva de participantes vía REST API directa con anon key.
drop policy if exists pol_part_select on public.participantes;
create policy pol_part_select on public.participantes for select
  using (public.es_admin());

drop policy if exists pol_part_insert on public.participantes;

drop policy if exists pol_part_update on public.participantes;
create policy pol_part_update on public.participantes for update
  using (public.es_admin());

drop policy if exists pol_part_delete on public.participantes;
create policy pol_part_delete on public.participantes for delete
  using (public.es_admin());

-- Sesiones: solo admin (lectura pública opcional para el escáner)
drop policy if exists pol_ses_select on public.sesiones;
create policy pol_ses_select on public.sesiones for select
  using (true);

drop policy if exists pol_ses_admin on public.sesiones;
create policy pol_ses_admin on public.sesiones for all
  using (public.es_admin()) with check (public.es_admin());

-- Asistencias: SOLO admin puede SELECTOR; la inserción se hace
-- a través de /api/asistencia (que usa service_role salta RLS).
-- Eliminamos la INSERT pública anónima para evitar falsificación de
-- asistencia vía REST API directa con la anon key.
drop policy if exists pol_asis_select on public.asistencias;
create policy pol_asis_select on public.asistencias for select
  using (public.es_admin());

drop policy if exists pol_asis_insert on public.asistencias;

drop policy if exists pol_asis_admin on public.asistencias;
create policy pol_asis_admin on public.asistencias for all
  using (public.es_admin()) with check (public.es_admin());

-- Certificados: verificación pública por código (select); admin todo.
drop policy if exists pol_cer_select on public.certificados;
create policy pol_cer_select on public.certificados for select
  using (true);

drop policy if exists pol_cer_admin on public.certificados;
create policy pol_cer_admin on public.certificados for all
  using (public.es_admin()) with check (public.es_admin());

-- Envíos WhatsApp: solo admin.
drop policy if exists pol_wha_admin on public.envios_whatsapp;
create policy pol_wha_admin on public.envios_whatsapp for all
  using (public.es_admin()) with check (public.es_admin());

-- Parámetros: lectura pública select; admin update.
drop policy if exists pol_par_select on public.parametros;
create policy pol_par_select on public.parametros for select
  using (true);

drop policy if exists pol_par_update on public.parametros;
create policy pol_par_update on public.parametros for update
  using (public.es_admin());

-- Admins: solo un admin puede ver la lista.
drop policy if exists pol_adm_select on public.admins;
create policy pol_adm_select on public.admins for select
  using (public.es_admin());

-- Storage: certificados bucket público de lectura.
drop policy if exists "pol_storage_cert_read" on storage.objects;
create policy pol_storage_cert_read on storage.objects for select
  using (bucket_id = 'certificados');

-- =====================================================================
-- FIN
-- =====================================================================
