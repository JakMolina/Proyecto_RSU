-- =====================================================================
-- CDWC-IA · Reset de datos de NEGOCIO (sin perder el acceso admin)
-- =====================================================================
-- Trunca TODO el contenido operativo del programa (asistencias,
-- certificados, sesiones, talleres, materiales, envíos WhatsApp y
-- participantes/docentes), PERO NO toca:
--   * auth.users          -> tus credenciales de admin siguen funcionando
--   * public.admins       -> tu cuenta sigue marcada como admin
--   * public.parametros   -> se conservan umbral/mensaje del programa
--
-- Tras ejecutarlo:
--   - La web arranca "sin datos" (dashboard en ceros).
--   - Sigues pudiendo entrar como admin con tu correo y contraseña.
--   - El bucket Storage "certificados" y "materiales" siguen existiendo.
--
-- Opcional: borrar los archivos PDF/materiales subidos a Storage,
-- descomentando los bloques FINAL. (Por defecto se conservan.)
--
-- IDEMPOTENTE: se puede ejecutar cuantas veces quieras.
-- =====================================================================

-- 1) Borrar envíos, certificados, asistencias (destruyen hacia sus FK)
truncate table public.envios_whatsapp  restart identity cascade;
truncate table public.certificados     restart identity cascade;
truncate table public.asistencias      restart identity cascade;

-- 2) Borrar materiales y sesiones y talleres
truncate table public.materiales restart identity cascade;
truncate table public.sesiones   restart identity cascade;
truncate table public.talleres   restart identity cascade;

-- 3) Borrar docentes/participantes
truncate table public.participantes restart identity cascade;

-- =====================================================================
-- OPCIONAL · Limpiar archivos de Storage subidos
-- (descomentar para borrar también los PDF y materiales del bucket)
-- =====================================================================
delete from storage.objects where bucket_id = 'certificados';
delete from storage.objects where bucket_id = 'materiales';

-- =====================================================================
-- Verificación rápida (ejecutar aparte para confirmar)
-- =====================================================================
-- select
--   (select count(*) from public.participantes)  as docentes,
--   (select count(*) from public.talleres)        as talleres,
--   (select count(*) from public.sesiones)        as sesiones,
--   (select count(*) from public.asistencias)     as asistencias,
--   (select count(*) from public.certificados)   as certificados,
--   (select count(*) from public.admins)          as admins;
--   -- admins debe seguir siendo >= 1 (tu cuenta sigue)

-- =====================================================================
-- FIN · Reset de datos
-- =====================================================================
