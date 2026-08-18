# CDWC-IA · Sitio Web

Sitio web del proyecto **CDWC-IA** — capacitación a docentes de la I.E.P. Wez College sobre uso ético, responsable y pedagógico de la IA, con control de asistencia por escaneo de DNI, panel de docentes, talleres/materiales descargables, certificación digital y envío por WhatsApp.

Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (PostgreSQL) · @react-pdf/renderer · html5-qrcode · WhatsApp Cloud API**. Despliegue en **Vercel + Supabase** (planes gratuitos).

---

## Árbol de archivos

```
web/
├─ package.json
├─ tsconfig.json
├─ next.config.js
├─ tailwind.config.ts
├─ postcss.config.js
├─ next-env.d.ts
├─ .eslintrc.json
├─ .env.example
├─ .env.local
├─ .gitignore
├─ public/
│  ├─ certificado-fondo.png          # fondo del PDF
│  └─ fonts/                         # Montserrat + Playfair Display (.ttf)
├─ supabase/
│  ├─ schema.sql                     # tablas base + RLS + triggers + storage + RPC
│  ├─ seed.sql                       # sesiones de ejemplo
│  ├─ migration_fase3.sql            # talleres + materiales (sesiones→talleres)
│  ├─ migration_fase4_sesiones_talleres.sql  # invierte jerarquía: sesión→talleres
│  └─ reset_datos.sql                # reinicio de datos (no esquema)
└─ src/
   ├─ types/index.ts                 # Participante, Sesion, Taller, Material, ...
   ├─ components/
   │  ├─ sidebar.tsx                 # navegación admin
   │  └─ site-header.tsx
   ├─ lib/
   │  ├─ supabase.ts                 # clientes (browser / anon / service)
   │  ├─ auth.ts                     # getSession (admin) + getDocente (cookie httpOnly)
   │  ├─ whatsapp.ts                 # WhatsApp Cloud API
   │  ├─ pdf.tsx                     # generación del certificado PDF (@react-pdf/renderer)
   │  ├─ csv.ts                      # export CSV
   │  └─ utils.ts
   └─ app/
      ├─ layout.tsx · globals.css
      ├─ (public)/                          # landing + login públicos
      │  ├─ layout.tsx
      │  ├─ page.tsx                        # landing con los 4 talleres
      │  └─ login/page.tsx                  # login admin / docente
      ├─ docente/                           # panel del docente (autenticado por DNI)
      │  ├─ layout.tsx
      │  ├─ page.tsx · PanelDocente.tsx     # progreso circular, certificado, talleres
      │  ├─ talleres/page.tsx
      │  ├─ talleres/[id]/page.tsx          # detalle del taller
      │  └─ materiales/page.tsx            # descarga de materiales
      ├─ admin/                             # panel administrativo (Supabase Auth)
      │  ├─ layout.tsx · login/page.tsx
      │  ├─ page.tsx                        # dashboard con métricas
      │  ├─ docentes/page.tsx              # CRUD docentes
      │  ├─ participantes/page.tsx
      │  ├─ sesiones/page.tsx              # crear / eliminar sesiones (+ talleres)
      │  ├─ escanear/page.tsx             # escáner DNI con la cámara (html5-qrcode)
      │  ├─ asistencias/page.tsx          # listado + export CSV / reportes
      │  ├─ certificados/page.tsx · CertActions.tsx · MassEnvioWhatsapp.tsx
      │  ├─ talleres/page.tsx · talleres/[id]/page.tsx  # gestión y subida de materiales
      │  └─ parametros/page.tsx           # umbral de asistencia + plantilla WhatsApp
      └─ api/
         ├─ registro/route.ts
         ├─ asistencia/route.ts            # registrar asistencia por DNI
         ├─ sesiones/route.ts             # listado público de sesiones (RLS)
         ├─ session/me/route.ts
         ├─ materiales/[id]/route.ts       # descarga pública de material (docente)
         ├─ export/asistencia/route.ts     # export CSV consolidado
         ├─ certificados/
         │  ├─ generar/route.ts           # genera PDF + sube a Storage
         │  └─ [codigo]/route.ts          # verificar + descargar PDF público
         ├─ whatsapp/enviar/route.ts      # envío individual / masivo
         ├─ docente/
         │  ├─ login/route.ts             # login por DNI (cookie httpOnly)
         │  └─ me/route.ts                # sesión actual del docente
         └─ admin/
            ├─ login/route.ts · me/route.ts
            ├─ docentes/route.ts · participantes/route.ts
            ├─ sesiones/route.ts
            ├─ talleres/route.ts · talleres/[id]/route.ts
            ├─ materiales/route.ts · materiales/[id]/route.ts   # subir/borrar a Storage
            ├─ parametros/route.ts · parametros/data/route.ts
            └─ reportes/route.ts          # reporte de asistencia filtrable
```

---

## Módulos implementados

| Módulo | Ruta | Descripción |
|-------|------|-------------|
| Landing pública | `/` | Información del programa, los 4 talleres y enlaces a login |
| Login unificado | `/login` | Acceso para **admin** (Supabase Auth) y **docente** (por DNI) |
| Panel docente | `/docente` | Progreso de asistencia (anillo %), estado del certificado, descarga de PDF, listado de talleres y materiales |
| Talleres (docente) | `/docente/talleres` y `/docente/talleres/[id]` | Listado y detalle de cada taller con sus materiales descargables |
| Materiales (docente) | `/docente/materiales` y `/api/materiales/[id]` | Descarga de archivos subidos por el admin (Supabase Storage) |
| Admin – Docentes | `/admin/docentes` | CRUD de docentes (DNI, nombres, apellidos, WhatsApp) |
| Admin – Sesiones | `/admin/sesiones` | CRUD de sesiones (4 sesiones, 2 días) y sus talleres |
| Admin – Escanear | `/admin/escanear` | Escáner de DNI con la cámara (`html5-qrcode`), registra asistencia |
| Admin – Asistencias | `/admin/asistencias` | Listado, reportes filtrables y exportación CSV |
| Admin – Talleres | `/admin/talleres` y `[id]` | Gestión de talleres y **subida de materiales** (≤ 20 MB, tipos validados) |
| Admin – Certificados | `/admin/certificados` | Cálculo de %, generación de PDF, envío individual y **masivo por WhatsApp** |
| Admin – Parámetros | `/admin/parametros` | Umbral de asistencia y plantilla del mensaje WhatsApp |
| Verificación pública | `/verificar` (vía `/api/certificados/[codigo]`) | Verifica y descarga certificado por código único |

---

## Puesta a punto local

```bash
cd web
cp .env.example .env.local      # rellena las claves
npm install
npm run dev                      # http://localhost:3000
```

Otros scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

### Configuración de Supabase (plan Free)

1. Crea un proyecto en https://supabase.com (plan Free, 500 MB DB).
2. **SQL Editor** → pega y ejecuta en orden:
   - `supabase/schema.sql`
   - `supabase/migration_fase3.sql` (tablas `talleres`, `materiales`)
   - `supabase/migration_fase4_sesiones_talleres.sql` (jerarquía sesión→talleres)
   - (Opcional) `supabase/seed.sql` para sesiones de ejemplo.
3. **Authentication → Providers → Email** habilitado.
4. **Authentication → Users → Add user**: crea `admin@cdwc-ia.edu.pe` con contraseña (Confirma el email).
5. En **SQL Editor** ejecuta:
   ```sql
   insert into public.admins(id, email)
   select id, email from auth.users where email='admin@cdwc-ia.edu.pe';
   ```
6. **Storage**: los buckets `certificados` y `materiales` se crean desde los scripts SQL; verifica permisos.
7. Copia **Project URL**, **anon key** y **service_role key** (Settings → API) a `.env.local`.

> Los docentes **no** usan Supabase Auth: inician sesión con su DNI (`/api/docente/login`), que setea una cookie `httpOnly`.

### Configuración de WhatsApp Cloud API (gratuito, Meta)

1. Entra a https://developers.facebook.com/apps y crea una app tipo **Business**.
2. Añade el producto **WhatsApp**. Verifica tu número de teléfono de prueba.
3. Copia **Phone Number ID** y **Access Token** permanente (System User).
4. Pega `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_API_TOKEN` en `.env.local`.
   - En modo **sandbox** sólo envías a números de prueba registrados.
   - Para producción con envíos masivos reales verifica el envío de plantillas siguiendo el flujo de Meta.

> Si Meta exige verificación comercial para adjuntar el PDF, alternativa gratuita: enviar un mensaje de texto con el enlace público del PDF (`SUPABASE_URL/storage/v1/object/public/certificados/...`).

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clave anon (cliente) |
| `SUPABASE_SERVICE_ROLE_KEY` | clave service_role (solo servidor) |
| `WHATSAPP_API_TOKEN` | token permanente de Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID de WhatsApp |
| `NEXT_PUBLIC_APP_URL` | dominio público (`https://cdwc-ia.vercel.app`) |

---

## Despliegue en Vercel (plan Hobby gratuito)

1. Sube el repo a GitHub.
2. En https://vercel.com → **New Project** → importa el repo, **Root Directory** = `web`.
3. **Environment Variables** (iguales a `.env.local`, ver tabla anterior).
4. **Deploy**. El build instala dependencias y publica automáticamente.

> Supabase en la misma región de Vercel (p. ej. AWS us-east-1) para minimizar latencia (< 3 s, requisito no funcional).

---

## Plan de pruebas mínimo

| # | Escenario | Pasos | Resultado esperado |
|---|-----------|-------|--------------------|
| P1 | Registro de docente | Admin: `/admin/docentes` → completar DNI/nombres/apellidos/WhatsApp → Registrar | Mensaje "Docente registrado" + fila en `participantes` |
| P2 | DNI duplicado | Registrar mismo DNI dos veces | Error "Ya existe un docente con ese DNI" |
| P3 | Crear sesión | `/admin/sesiones` → completar nombre/fecha/hora → Crear | Sesión visible + seleccionable en `/admin/escanear` |
| P4 | Crear taller + material | `/admin/talleres` → crear taller en una sesión → subir PDF | Material listado en `/docente/materiales` |
| P5 | Escaneo de DNI | `/admin/escanear` → elegir sesión → escanear DNI | "Asistencia registrada: [nombre]" |
| P6 | Duplicado de asistencia | Mismo DNI en la misma sesión | "Ya registró asistencia" |
| P7 | Login docente | `/login?as=docente` → ingresar DNI | Redirección a `/docente` con progreso |
| P8 | Cálculo de % | Marcar ≥ umbral → `/admin/certificados` | Badge "listo" en la fila |
| P9 | Generar certificado | Click "Generar" | PDF en Storage, código visible, botón "Ver" |
| P10 | Descarga PDF | `/docente` (o admin) → Descargar PDF | PDF válido con datos correctos |
| P11 | Envío WhatsApp | Click "WhatsApp" (individual o masivo) | Registro `ENVIADO` en `envios_whatsapp` |
| P12 | Verificación pública | `/verificar` con el código | Datos del certificado + descarga |
| P13 | No cumple umbral | Docente con < 75 % | Botón "Generar" no aparece / API responde 409 |

---

## Tabla de costos (objetivo: S/. 0.00)

| Servicio | Plan | Costo mensual |
|----------|------|--------------|
| Vercel (frontend + edge functions) | Hobby | S/. 0.00 |
| Supabase (DB / Auth / Storage) | Free | S/. 0.00 |
| WhatsApp Cloud API | Free tier (1 000 conversaciones/mes) | S/. 0.00 |
| @react-pdf/renderer / html5-qrcode / Next.js | Open source | S/. 0.00 |
| Dominio (opcional) `.vercel.app` | incluido | S/. 0.00 |
| **Total** | | **S/. 0.00** |

**Alternativas de paga (solo si excede límites del gratuito):**

| Concepto | Proveedor | Costo aprox. | Motivo |
|----------|-----------|--------------|--------|
| Dominio propio `.pe` | ..pe registrar | S/. 30/año ~ S/. 2.5/mes | Imagen institucional (opcional) |
| Supabase Pro | Supabase | USD 25/mes (~S/. 95) | Solo si supera 500 MB / 50k MAU |
| Render (Node server) | Render Starter | USD 7/mes (~S/. 27) | Solo si @react-pdf necesita runtime Node distinto a Vercel |
| Twilio WhatsApp | Twilio | ~S/. 0.04/msg | Solo si Meta Cloud API llega al límite de 1 000/mes |

Cualquier excedente **no debe superar el presupuesto total del proyecto de S/. 290.00**. Con los datos del proyecto (≤ 30 docentes, 4 sesiones, ≤ 30 certificados) los planes gratuitos son suficientes.

---

## Seguridad

- Supabase **RLS** activado en todas las tablas.
- Inserción de docentes/asistencias solo vía el servidor con `service_role` (sin INSERT público anónimo).
- `SUPABASE_SERVICE_ROLE_KEY` sólo en el servidor (nunca en cliente).
- Cookies de sesión `httpOnly` para el área admin **y** para el panel docente.
- Subida de materiales validada por MIME + extensión, máx. 20 MB.
- Certificados accesibles para descarga solo mediante su **código único**.

---

## Mapeo a requisitos (acta / scope)

| Requisito | Implementación |
|-----------|----------------|
| RE01 Registro de participantes | `/admin/docentes` + `/api/admin/docentes` (solo admin) |
| RE02 Asistencia por código de barras del DNI | `/admin/escanear` (html5-qrcode) + `/api/asistencia` |
| RE03 Cálculo automático % asistencia | función RPC `calcular_porcentaje_asistencia` |
| RE04 Envío WhatsApp | `/api/whatsapp/enviar` (individual y masivo) |
| RE05 Certificado PDF descargable | `/api/certificados/[codigo]` + Storage |
| RE09 Interfaz intuitiva / responsive | Tailwind + componentes, mobile-first |
| RE13 100 % certificados sin errores | datos generados desde la BD; plantilla fija |
| RE15 Herramientas gratuitas | Vercel + Supabase + librerías OSS |
| Materiales de los talleres | `/admin/talleres` (subir) + `/docente/materiales` y `/api/materiales/[id]` (descarga) |
| Panel del docente | `/docente` con progreso, certificado y acceso a materiales |
