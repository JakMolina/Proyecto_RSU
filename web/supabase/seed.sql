-- Seed: 2 sesiones (días) + 4 talleres del programa CDWC-IA.
-- Jerarquía: Sesión -> Talleres. La asistencia se toma por sesión.
-- Ejecutar después de schema.sql (idempotente).

insert into public.sesiones (nombre, fecha, hora_inicio, hora_fin)
select v.nombre, v.fecha, v.hora_inicio, v.hora_fin
from (values
  ('Día 1 · Sesión de capacitación', date '2026-07-07', time '08:00', time '12:30'),
  ('Día 2 · Sesión de capacitación', date '2026-07-08', time '08:00', time '12:30')
) as v(nombre, fecha, hora_inicio, hora_fin)
where not exists (select 1 from public.sesiones s where s.fecha = v.fecha)
on conflict do nothing;

insert into public.talleres (session_id, nombre, descripcion, orden)
select s.id, v.nombre, v.descripcion, v.orden
from (values
  (1, date '2026-07-07', 'Introducción a la IA y Uso Ético en Educación',
      'Reconocimiento de imágenes, videos y textos generados por IA, riesgos, sesgos y uso responsable.'),
  (2, date '2026-07-07', 'ChatGPT, Diseño de Prompts y Canva Magic Design',
      'Construcción de instrucciones efectivas y generación de recursos educativos.'),
  (3, date '2026-07-08', 'Investigación Educativa con NotebookLM',
      'Organización del aprendizaje, validación de información y uso ético de fuentes.'),
  (4, date '2026-07-08', 'Google Labs y Estrategias para el Uso Responsable',
      'Aplicaciones educativas de Flow y Flow Music, normas para el uso de IA.')
) as v(orden, fecha, nombre, descripcion)
join public.sesiones s on s.fecha = v.fecha
where not exists (select 1 from public.talleres t where t.orden = v.orden)
on conflict do nothing;

-- Crear usuario administrador en Supabase Auth vía dashboard, luego:
-- insert into public.admins (id, email) select id, email from auth.users where email = 'admin@cdwc-ia.edu.pe';
