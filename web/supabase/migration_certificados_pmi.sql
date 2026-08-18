-- =====================================================================
-- MIGRACIÓN: Agregar columna storage_path_pmi a certificados
-- =====================================================================

alter table public.certificados
add column if not exists storage_path_pmi text;

-- Índice opcional para búsquedas
create index if not exists idx_certificados_storage_pmi on public.certificados(storage_path_pmi);