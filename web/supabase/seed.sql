-- Seed: 4 sesiones del programa CDWC-IA (ejecutar después de schema.sql)

insert into public.sesiones (nombre, taller_numero, fecha, hora_inicio, hora_fin) values
  ('Introducción a la IA y Uso Ético en Educación', 1, '2026-07-07', '08:00', '10:00'),
  ('ChatGPT, Diseño de Prompts y Canva Magic Design', 2, '2026-07-07', '10:30', '12:30'),
  ('Investigación Educativa con NotebookLM', 3, '2026-07-08', '08:00', '10:00'),
  ('Google Labs y Estrategias para el Uso Responsable', 4, '2026-07-08', '10:30', '12:30')
on conflict do nothing;

-- Crear usuario administrador en Supabase Auth vía dashboard, luego:
-- insert into public.admins (id, email) select id, email from auth.users where email = 'admin@cdwc-ia.edu.pe';
