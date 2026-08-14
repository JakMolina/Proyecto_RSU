# CDWC-IA · Sitio Web

Sitio web del proyecto **CDWC-IA** — capacitación a docentes de la I.E.P. Wez College sobre uso ético, responsable y pedagógico de la IA, con control de asistencia por escaneo de DNI y certificación digital automática por WhatsApp.

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
├─ .env.example
├─ .gitignore
├─ supabase/
│  ├─ schema.sql        # Tablas, RLS, triggers, storage, función RPC
│  └─ seed.sql          # 4 sesiones de ejemplo
└─ src/
   ├─ types/index.ts
   ├─ lib/
   │  ├─ supabase.ts    # clientes (browser / anon / service)
   │  ├─ auth.ts        # sesión admin vía cookie
   │  ├─ whatsapp.ts    # WhatsApp Cloud API
   │  ├─ pdf.ts         # generación certificado PDF
   │  ├─ csv.ts         # export CSV
   │  └─ utils.ts
   ├─ app/
   │  ├─ layout.tsx · globals.css · page.tsx        # landing pública
   │  ├─ registro/page.tsx                          # auto-registro docente
   │  ├─ asistencia/page.tsx                        # escáner DNI (cámara)
   │  ├─ verificar/page.tsx                         # verificación por código
   │  ├─ admin/
   │  │  ├─ layout.tsx · login/page.tsx
   │  │  ├─ page.tsx                 # dashboard
   │  │  ├─ participantes/page.tsx
   │  │  ├─ sesiones/page.tsx       # crear / eliminar sesiones
   │  │  ├─ asistencias/page.tsx   # listado + export CSV
   │  │  ├─ certificados/page.tsx + CertActions.tsx  # generar PDF + enviar WhatsApp
   │  │  └─ parametros/page.tsx
   │  └─ api/
   │     ├─ registro/route.ts
   │     ├─ asistencia/route.ts
   │     ├─ sesiones/route.ts
   │     ├─ certificados/
   │     │  ├─ generar/route.ts
   │     │  └─ [codigo]/route.ts   # verificar + descargar PDF
   │     ├─ whatsapp/enviar/route.ts
   │     ├─ export/asistencia/route.ts
   │     └─ admin/
   │        ├─ login/route.ts · me/route.ts
   │        ├─ sesiones/route.ts
   │        └─ parametros/route.ts + parametros/data/route.ts
```

---

## Puesta a punto local

```bash
cd web
cp .env.example .env.local      # rellena claves
npm install
npm run dev                      # http://localhost:3000
```

### Configuración de Supabase (plan Free)

1. Crea un proyecto en https://supabase.com (plan Free, 500 MB DB).
2. **SQL Editor** → pega y ejecuta `supabase/schema.sql`.
3. (Opcional) ejecuta `supabase/seed.sql` para crear las 4 sesiones.
4. **Authentication → Providers → Email** habilitado.
5. **Authentication → Users → Add user**: crea `admin@cdwc-ia.edu.pe` con contraseña (Confirma el email).
6. En **SQL Editor** ejecuta:
   ```sql
   insert into public.admins(id, email)
   select id, email from auth.users where email='admin@cdwc-ia.edu.pe';
   ```
7. **Storage**: el bucket `certificados` se crea en `schema.sql`; verifícalo como público.
8. Copia **Project URL**, **anon key** y **service_role key** (Settings → API) a `.env.local`.

### Configuración de WhatsApp Cloud API (gratuito, Meta)

1. Entra a https://developers.facebook.com/apps y crea una app tipo **Business**.
2. Añade el producto **WhatsApp**. Verifica tu número de teléfono de prueba.
3. Copia **Phone Number ID** y **Access Token** permanente (System User).
4. Pega `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_API_TOKEN` en `.env.local`.
   - En modo **sandbox** sólo envías a números de prueba registrados.
   - Para producción con envíos masivos reales verifica el envío de plantillas/documento siguiendo el flujo de Meta. Mientras tanto, el certificado también queda disponible para descarga web y verificación pública.

> Si Meta exige verificación comercial para adjuntar el PDF, alternativa: enviar un mensaje de texto con el enlace público del PDF (`SUPABASE_URL/storage/v1/object/public/certificados/...`). Esto no requiere verificación y es 100 % gratuito.

---

## Despliegue en Vercel (plan Hobby gratuito)

1. Sube el repo a GitHub.
2. En https://vercel.com → **New Project** → importa el repo, **Root Directory** = `web`.
3. **Environment Variables** (iguales a `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WHATSAPP_API_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`
   - `NEXT_PUBLIC_APP_URL` = tu dominio Vercel (`https://cdwc-ia.vercel.app`)
4. **Deploy**. El build instala dependencias y publica automáticamente.

> Supabase en la misma región de Vercel (p. ej. AWS us-east-1) para minimizar latencia (< 3 s, RE no funcional).

---

## Plan de pruebas mínimo

| # | Escenario | Pasos | Resultado esperado |
|---|-----------|-------|--------------------|
| P1 | Registro de docente | `/registro` → completar DNI/nombres/apellidos/WhatsApp → Enviar |Mensaje "Registro exitoso" + fila en tabla `participantes` |
| P2 | DNI duplicado | Registrar mismo DNI dos veces | Error "Ya existe un registro con ese DNI" |
| P3 | Crear sesión (admin) | `/admin/sesiones` → completar taller/fecha/hora → Crear | Sesión visible + seleccionable en `/asistencia` |
| P4 | Escaneo de DNI | `/asistencia` → elegir sesión → escanear DNI | "Asistencia registrada: [nombre]" |
| P5 | Duplicado de asistencia | Mismo DNI en la misma sesión | "Ya registró asistencia" |
| P6 | Cálculo de % | Marcar ≥ umbral → `/admin/certificados` | Badge "listo" en la fila |
| P7 | Generar certificado | Click "Generar" | PDF creado en Storage, código visible, link "Ver" |
| P8 | Descarga PDF | `/verificar` con el código → Descargar PDF | PDF válido con datos correctos |
| P9 | Envío WhatsApp | Click "WhatsApp" en admin | Registro `ENVIADO` en `envios_whatsapp` y mensaje al docente |
| P10 | No cumple umbral | Docente con < 75 % | Botón "Generar" no aparece / API responde 409 |

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

Cualquier excedente **no debe superar el presupuesto total del proyecto de S/. 290.00**. Con los datos del proyecto (≤ 30 docentes, 2 sesiones, ≤ 30 certificados) los planes gratuitos son suficientes.

---

## Seguridad

- Supabase **RLS** activado en todas las tablas.
- Inserción pública solo en `participantes` y `asistencias`; el resto requiere admin.
- `SUPABASE_SERVICE_ROLE_KEY` sólo en el servidor (nunca en cliente).
- Cookie de sesión `httpOnly` para el área admin.
- Certificados verificables públicamente solo por **código único**.

---

## Mapeo a requisitos (acta / scope)

| Requisito | Implementación |
|-----------|----------------|
| RE01 Registro de participantes | `/registro` + `/api/registro` |
| RE02 Asistencia por código de barras del DNI | `/asistencia` (html5-qrcode) + `/api/asistencia` |
| RE03 Cálculo automático % asistencia | función RPC `calcular_porcentaje_asistencia` |
| RE04 Envío WhatsApp | `/api/whatsapp/enviar` |
| RE05 Certificado PDF descargable | `/api/certificados/[codigo]` + Storage |
| RE09 Interfaz intuitiva / responsive | Tailwind + shadcn-style components |
| RE13 100 % certificados sin errores | datos generados desde la BD; plantilla fija |
| RE15 Herramientas gratuitas | Vercel + Supabase + librerías OSS |
