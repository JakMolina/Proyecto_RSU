# PROMPT PARA DESARROLLAR EL SITIO WEB — PROYECTO CDWC-IA

Actúa como un/a ingeniero/a de software full-stack senior. Tu tarea es desarrollar **completamente** (código funcional, estructura de archivos, configuración y despliegue) el sitio web descrito a continuación. Trabaja de forma incremental, modular y comenta solo lo estrictamente necesario.

---

## 1. CONTEXTO DEL PROYECTO

**Proyecto:** "Capacitación a docentes de la I.E.P. Wez College sobre uso ético, responsable y pedagógico de la Inteligencia Artificial, apoyado por un sitio web de control de asistencia y certificación digital".
**Siglas:** CDWC-IA
**Institución beneficiaria:** I.E.P. Wez College (Cajamarca – Perú)
**Equipo ejecutor:** Estudiantes de Ingeniería de Sistemas — UNC.
**Duración:** 09/06/2026 al 28/07/2026. Sesiones de capacitación: 07 y 08/07/2026.

El proyecto tiene dos componentes:
1. Un programa de capacitación docente (4 talleres) — **fuera del alcance de este sitio**, pero el sitio lo soporta.
2. Un **sitio web** que automatiza el registro de participantes, el control de asistencia (escaneando el código de barras del DNI con la cámara del celular) y la generación + envío automático de certificados digitales en PDF por WhatsApp.

**Este prompt aborda únicamente el desarrollo del SITIO WEB.**

---

## 2. STACK TECNOLÓGICO OBLIGATORIO (todo gratuito / libre)

La documentación exige **exclusivamente herramientas de libre acceso o gratuitas** y un presupuesto total del proyecto ≤ S/. 290.00 (sin licencias de software). Usa:

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| Framework frontend | **Next.js 14+ (App Router)** con TypeScript | Gratis, SSR/SSG, rutas API integradas. |
| Estilos | **Tailwind CSS** + **shadcn/ui** (u otra lib de componentes/************************************************************************************************************/__) | Componentes accesibles y gratuitos. |
| Base de datos + Auth | **Supabase** (PostgreSQL) — plan Free | 500 MB DB, auth, storage y edge functions gratis. |
| Autenticación admin | **Supabase Auth** (email/contraseña) | Acceso administrativo protegido. |
| Lector de código de barras | **html5-qrcode** o **@zxaptec/library** vía cámara (getUserMedia) | Librería open source, escaneo del DNI peruano en el celular. |
| Generación de PDF | **@react-pdf/renderer** o **pdf-lib** + plantilla canvas | Certificados PDF en cliente/servidor sin costos. |
| Envío por WhatsApp | **WhatsApp Cloud API (Meta)** — tier gratuito, o **Whapi / Wassenger** free trial, o **wa.me + Twilio sandbox** | Elige la opción gratuita que garantice ≥ 100% de envíos durante las sesiones. Si ninguna gratuita fuese viable, documenta el costo mínimo y propón la alternativa de paga más barata. |
| Hosting/despliegue | **Vercel** (plan Hobby gratuito) para el frontend + edge functions; **Supabase** para DB/auth/storage | 100% gratuito para este volumen de usuarios. |
| CI/versionado | **Git + GitHub** | —

**Servidor gratuito:** despliega todo en Vercel + Supabase (ambos tier free). **Si por limitaciones técnicas el gratuito no fuera suficiente** (p. ej. froid en CPU/disk, envíos de WhatsApp, dominio propio), proponga **una** alternativa de **paga mínima** (Render Starter, Railway, Hostinger VPS, dominio .pe barato) indicando costo mensual y por qué es necesaria. En tal caso **nunca** debe exceder el presupuesto total de S/. 290.00.

---

## 3. MÓDULOS Y FUNCIONALIDADES A IMPLEMENTAR

### 3.1 Módulo de Registro de Participantes (RE01)
- Formulario de registro de docentes con: **DNI, nombres y apellidos, número de WhatsApp**.
- Validación de DNI peruano (8 dígitos numéricos). Validación de número WhatsApp (formato +51 9xx xxx xxx).
- Página pública de auto-registro (cada docente se registra) y panel admin para registrar/editar/consultar.
- Persistencia en Supabase (tabla `participantes`).

### 3.2 Módulo de Control de Asistencia (RE02)
- Vista **móvil-first** que abre la cámara del celular y escanea el código de barras del DNI.
- Al leer el código (8 dígitos), buscar al participante; si existe, registrar asistencia con **fecha y hora** y **id de sesión**.
- **Una sola asistencia por docente por sesión** (evitar duplicados). Mostrar feedback visual (check/ok/error) inmediato.
- Panel admin: ver asistencias por sesión, ver historial por participante, exportar reporte consolidado (CSV).
- Tablas: `sesiones`, `asistencias`.

### 3.3 Módulo de Certificación Digital (RE03 + RE05)
- Algoritmo que **calcula automáticamente el porcentaje de asistencia** por participante.
- Define requisito mínimo de asistencia (p. ej. ≥ 75% de las sesiones) — parametrizable en el panel admin.
- Si cumple, **genera certificado PDF** personalizado con: nombre del docente, nombre del taller/programa, fecha, firma digital ( Universidad Nacional de Cajamarca + Wez College ), código de verificación único.
- Almacenar certificados en Supabase Storage y registrar en tabla `certificados`.
- Permitir **descarga web** del PDF y verificación pública vía código.

### 3.4 Módulo de Envío por WhatsApp (RE04)
- Enviar automáticamente el PDF del certificado al número de WhatsApp registrado.
- Manejar reintentos y logging de envíos (tabla `envios_whatsapp` con estado Pendiente/Enviado/Fallido).
- Panel admin para re-envío manual individual o masivo.

### 3.5 Panel Administrativo (Auth)
- Login (Supabase Auth) — solo usuarios administradores autorizados.
- Dashboard con métricas: total registrados, asistencia por sesión, % de certificación, envíos OK/fallidos.
- Gestión de sesiones (4 sesiones / 2 días), parámetros (umbral de asistencia), gestión de participantes, asistencias y certificados.

### 3.6 Página pública / Landing
- Página informativa del programa: descripción, los 4 talleres, herramientas (ChatGPT, Canva Magic Design, NotebookLM, Google Labs Flow / Flow Music), fechas, docentes a cargo.
- Botón "Registrarme" → formulario de registro (RE01).
- Botón "Registrar mi asistencia" → escáner (RE02).
- Sección de verificación de certificado por código.

---

## 4. REQUISITOS NO FUNCIONALES (obligatorios)

- Interfaz **intuitiva, clara y sencilla** (RE09). Diseño responsive, mobile-first (la asistencia se toma desde el celular).
- Tiempo de respuesta de consultas **≤ 3 segundos**.
- Registro de asistencia **inmediato** (no bloquear UI durante el guardado).
- Acceso administrativo **protegido por autenticación**.
- Información de los participantes **almacenada de forma segura** (mínimo: no exponer datos sensibles en cliente; RLS con Supabase).
- Certificados accesibles **solo para autorizados** o vía enlace público de verificación con código único.
- Site **disponible durante todo el desarrollo del proyecto** y especialmente en las sesiones del 07 y 08/07/2026.
- **100% de los certificados generados sin errores** (RE13) y **100% de asistencias registradas digitalmente**.
- Compatibilidad con **escaneo de DNI peruano** (código de barras Code39 / intercalado).
- **Todos los servicios en su tier gratuito** (RE15). Documentar cualquier excepción con costo.

---

## 5. CRITERIOS DE ACEPTACIÓN DEL SITIO WEB

- El sitio está **desplegado** y accesible públicamente (URL).
- Registra correctamente la asistencia por escaneo de DNI y genera certificados PDF **con 100% de fiabilidad durante las sesiones**.
- Cumple los 4 módulos + panel admin + landing pública.
- Presupuesto de servicios ≤ S/. 290.00.
- 100% de certificados generados sin errores ortográficos ni de datos (RE13).

---

## 6. ESTRUCTURA DE ENTREGABLES QUE DEBES PRODUCIR

1. **Árbol de archivos** completo del proyecto (monorepo Next.js).
2. **Esquema SQL** completo para Supabase (tablas, RLS, storage, triggers).
3. **Código fuente** de todos los componentes, páginas, rutas API, utilidades y clients de Supabase.
4. **Variables de entorno** necesarias (`.env.example`) y pasos de configuración en Supabase + Vercel.
5. **Guía de despliegue paso a paso** en Vercel + Supabase (gratuito), incluyendo cómo configurar WhatsApp Cloud API.
6. **Plan de pruebas** mínimo: registro, escaneo DNI, cálculo de %, generación/ descarga /envío de certificado.
7. Si alguna integración **no es viable en gratis**, **indícala claramente** con: motivo + alternativa de paga más barata + costo mensual + impacto en el presupuesto de S/. 290.00.

---

## 7. RESTRICCIONES Y EXCLUSIONES (respétalas estrictamente)

**Restricciones:**
- Solo herramientas gratuitas / libre acceso.
- Presupuesto total del proyecto ≤ S/. 290.00.
- Moderar el acceso administrativo con autenticación.
- Disponibilidad operativa garantizada durante todas las sesiones de capacitación.

**Exclusiones (NO implementar):**
- No evaluaciones en línea, ni analítica avanzada, ni seguimiento académico, ni integración con sistemas externos institucionales.
- No suministro/administración de equipos físicos.
- No capacitación a estudiantes/padres/administrativos (solo docentes).
- No funcionalidades extra fuera de los 4 módulos descritos.

---

## 8. CONTENIDO DEL PROGRAMA (para la landing y los certificados)

Programa formativo — 4 talleres secuenciales, en 2 días:

**DÍA 1**
- **Taller 1:** Introducción a la IA, reconocimiento de contenido generado por IA y uso ético en educación. Herramientas: ChatGPT, Google Labs (Flow y Flow Music).
- **Taller 2:** Aprovechamiento pedagógico de ChatGPT, diseño de prompts y creación de recursos educativos con Canva Magic Design. Herramientas: ChatGPT, Canva Magic Design.

**DÍA 2**
- **Taller 3:** Investigación educativa y aprendizaje responsable con NotebookLM. Herramienta: NotebookLM.
- **Taller 4:** Uso educativo de Google Labs (Flow y Flow Music) y diseño de estrategias para enseñar el uso responsable de la IA a los estudiantes. Herramienta: Google Labs Flow, Flow Music.

Texto base del certificado:
> "La Universidad Nacional de Cajamarca — Facultad de Ingeniería, Escuela Académico Profesional de Ingeniería de Sistemas, otorga el presente certificado a [NOMBRE DOCENTE] por haber aprobado el Programa de Capacitación en Uso Ético, Responsable y Pedagógico de la Inteligencia Artificial, realizado los días 07 y 08 de julio de 2026 en la I.E.P. Wez College, Cajamarca – Perú, habiendo cumplido con el [PORCENTAJE]% de asistencia. Código de verificación: [CODIGO]."

---

## 9. CÓMO EMPEZAR

1. Genera primero el **árbol de archivos** y la **estructura en Supabase** (SQL).
2. Implementa después **módulo por módulo** en este orden: Registro → Asistencia (escáner) → Certificación (cálculo + PDF) → Envío WhatsApp → Panel admin → Landing.
3. Verifica cada módulo con un mini plan de prueba antes de avanzar.
4. Entrega finalmente la **guía de despliegue** en Vercel + Supabase y la **tabla de costos** (todos $0 en lo posible).
5. **Repite en código en español** los nombres visibles (labels, textos, certificados), pero usa inglés para identificadores de variables/tablas.

Comienza ahora con el paso 1: presenta el árbol de archivos y el script SQL de Supabase.
