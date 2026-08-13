# DOCUMENTACIÓN DE REQUISITOS

**UNIVERSIDAD NACIONAL DE CAJAMARCA**
**FACULTAD DE INGENIERÍA**
**ESCUELA ACADÉMICO PROFESIONAL DE INGENIERÍA DE SISTEMAS**

**Asignatura:** Gestión de Proyectos de Sistemas I
**Docente:** Ing. Zocon Alva Oscar Gilberto
**Presentado por:**
* Flores Valencia, Luis Antonio
* Gutierrez Cotrina Antony David
* Huamán Gonzales, Kevin Jhoel
* Marín Valdez, Amner Jhonatan
* Molina Campos, Jak Steve
* Ruiz Rudas, Luis Manuel

**Semestre:** 2026 – I 
**Fecha y Lugar:** Junio de 2026, Cajamarca – Perú  

---

## CONTROL DE VERSIONES

| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1.0 | • Flores Valencia, Luis Antonio<br>• Gutiérrez Cotrina, Antony David.<br>• Huamán Gonzales Kevin Jhoel<br>• Marin Valdez, Amner Jhonatan<br>• Molina Campos, Jak Steve<br>• Ruiz Rudas, Luis Manuel | Dr. Ing. Oscar Zocón Alva | Dr. Ing. Oscar Zocón Alva | 18/06/2026 | Versión original |

---

## DOCUMENTACIÓN DE REQUISITOS

**NOMBRE DEL PROYECTO:**  
CAPACITACIÓN A DOCENTES DE LA I.E.P. WEZ COLLEGE SOBRE USO ÉTICO, RESPONSABLE Y PEDAGÓGICO DE LA INTELIGENCIA ARTIFICIAL, APOYADO POR UN SITIO WEB DE CONTROL DE ASISTENCIA Y CERTIFICACIÓN DIGITAL

**SIGLAS DEL PROYECTO:** CDWC-IA

---

## NECESIDAD DEL NEGOCIO U OPORTUNIDAD A APROVECHAR: DESCRIBIR LAS LIMITACIONES DE LA SITUACIÓN ACTUAL Y LAS RAZONES POR LAS CUÁLES SE EMPRENDE EL PROYECTO.
* Fortalecer las competencias digitales, éticas y pedagógicas de los docentes de la I.E.P. Wez College frente a la necesidad de incorporar la Inteligencia Artificial (IA) en los procesos de enseñanza y aprendizaje de forma responsable.
* Automatizar y modernizar la gestión administrativa de las capacitaciones (registro, control de asistencia y certificación) a través de un sitio web de apoyo.
* Posicionar a la I.E.P. Wez College como referente institucional en innovación educativa tecnológica.

## OBJETIVOS DEL NEGOCIO Y DEL PROYECTO: DEFINIR CON CLARIDAD LOS OBJETIVOS DEL NEGOCIO Y DEL PROYECTO PARA PERMITIR LAS TRAZABILIDAD DE ÉSTOS.
* Mejorar la calidad educativa mediante la capacitación docente en el uso de herramientas de IA para la generación de recursos y el fomento del pensamiento crítico en los estudiantes.
* Fortalecer las capacidades digitales de los docentes de la I.E.P. Wez College, logrando capacitar el 90% o más de los convocados, con el 80% o más aplicando las herramientas en la generación de recursos educativos.
* Ejecutar el programa de capacitación y el proyecto en el plazo establecido, cumpliendo el cronograma de sesiones al 100%.
* Desarrollar e implementar operativamente un sitio web para el control de asistencia, gestión de materiales y certificación digital.
* Implementar operativamente de la plataforma web y las capacitaciones en el plazo establecido, cumpliendo con el presupuesto estimado de S/.290.00.

## REQUISITOS FUNCIONALES: DESCRIBIR PROCESOS DEL NEGOCIO, INFORMACIÓN, INTERACCIÓN CON EL PRODUCTO, ETC.

| STAKEHOLDER | PRIORIDAD OTORGADA POR EL STAKEHOLDER | CÓDIGO | DESCRIPCIÓN DE REQUISITOS |
| :--- | :--- | :--- | :--- |
| Isabel Estrada Zafra (Directora) | Muy alto | RE01 | Desarrollar un módulo para registrar a los docentes participantes, almacenando información personal básica y su número de WhatsApp. |
| | Muy alto | RE02 | Habilitar el registro de asistencia mediante lector de código de barras, almacenando fecha y hora por cada sesión para automatizar el control. |
| | Muy alto | RE03 | Calcular de forma automática el porcentaje de asistencia de cada participante para validar los requisitos mínimos de certificación. |
| | Alto | RE04 | Enviar automáticamente los certificados digitales generados al número de WhatsApp de cada docente que haya aprobado. |
| Docentes Wez College (Beneficiarios) | Muy alto | RE05 | Generar los certificados digitales en formato PDF de manera automática y permitir su descarga web. |
| | Alto | RE06 | Ejecutar un programa de capacitación de cuatro talleres secuenciales sobre el uso ético, responsable y pedagógico de la Inteligencia Artificial. |
| | Alto | RE07 | Proveer materiales educativos digitales, casos de aplicación y tutoriales complementarios que apoyen el autoaprendizaje docente durante y después de las sesiones. |

## REQUISITOS NO FUNCIONALES: DESCRIBIR REQUISITOS TALES CÓMO NIVEL DE SERVICIO, PERFOMANCE, SEGURIDAD, ADECUACIÓN, ETC.

| STAKEHOLDER | PRIORIDAD OTORGADA POR EL STAKEHOLDER | CÓDIGO | DESCRIPCIÓN DE REQUISITOS |
| :--- | :--- | :--- | :--- |
| Amner Marin Valdez (Project Manager) | Alto | RE08 | Implementar una metodología formativa práctica y secuencial en los talleres que promueva el diseño real de estrategias educativas en los docentes. |
| | Muy alto | RE09 | Desarrollar una interfaz web intuitiva, de navegación clara y sencilla. |
| | Alto | RE10 | Asegurar la compatibilidad plena del sistema web con la integración del hardware físico (lector de código de barras). |
| Dr. Ing. Oscar Zocón Alva (Sponsor) | Alto | RE11 | Garantizar el correcto desarrollo de todo el ciclo de vida del proyecto. |

## REQUISITOS DE CALIDAD: DESCRIBIR REQUISITOS RELATIVOS A NORMAS O ESTÁNDARES DE CALIDAD, O LA SATISFACCIÓN Y CUMPLIMIENTO DE FACTORES RELEVANTES DE CALIDAD.

| STAKEHOLDER | PRIORIDAD OTORGADA POR EL STAKEHOLDER | CÓDIGO | DESCRIPCIÓN DE REQUISITOS |
| :--- | :--- | :--- | :--- |
| Dr. Ing. Oscar Zocón Alva (Sponsor) | Muy alto | RE12 | Alcanzar un nivel de satisfacción docente de al menos 85% medido a través de encuestas al finalizar las capacitaciones. |
| Amner Marin Valdez (Project Manager) | Muy alto | RE13 | Garantizar que el 100% de los certificados digitales se generen e impriman sin errores ortográficos ni de datos de los participantes. |
| | Muy alto | RE14 | Lograr que ≥ 80% de los docentes capacitados desarrollen una propuesta, estrategia o material educativo aplicando criterios éticos y herramientas de IA. |
| | Alto | RE15 | Asegurar exclusivamente el uso de tecnologías y herramientas de libre acceso para todo el desarrollo y ejecución del proyecto. |

## CRITERIOS DE ACEPTACIÓN: ESPECIFICACIONES O REQUISITOS DE RENDIMIENTO, FUNCIONALIDAD, ETC., QUE DEBEN CUMPLIRSE ANTES DE ACEPTAR EL PROYECTO.

| CONCEPTOS | CRITERIOS DE ACEPTACIÓN |
| :--- | :--- |
| **1. TÉCNICOS** | Ejecución de los talleres presenciales de Inteligencia Artificial utilizando las herramientas previstas. El sitio web debe estar desplegado, compatible con el lector de barras y enviando mensajes por WhatsApp correctamente. |
| **2. DE CALIDAD** | Nivel de satisfacción docente ≥ 85%, ≥ 80% de docentes generando sus propuestas de uso ético de IA, y ≥ 100% de certificados generados sin errores. |
| **3. ADMINISTRATIVOS** | Aprobación oficial y entrega completa de: Plan de Capacitación, Materiales de los talleres, Registro de Asistencia, Registro Fotográfico, Informe Final y Resultados de las Evaluaciones. |
| **4. COMERCIALES** | No exceder el presupuesto detallado de S/. 290.00. |
| **5. SOCIALES** | Lograr la capacitación del 90% o más de los convocados, con el 80% o más aplicando las herramientas en la generación de recursos educativos. |
| **6. OTROS** | Ninguno. |

## REGLAS DEL NEGOCIO: REGLAS PRINCIPALES QUE FIJAN LOS PRINCIPIOS GUÍAS DE LA ORGANIZACIÓN.
* El sistema registrará la asistencia de cada docente mediante la lectura del código de barras asociado a su número de DNI durante cada sesión programada de capacitación.
* Cada docente podrá registrar una sola asistencia por sesión de capacitación para evitar duplicidad de registros.
* El sistema verificará automáticamente el cumplimiento de los requisitos mínimos de participación antes de emitir cualquier certificado digital.
* Los certificados digitales serán enviados únicamente al número de WhatsApp registrado por cada participante.
* Todo el software, herramientas de Inteligencia Artificial y tecnologías empleadas durante el proyecto deberán ser de libre acceso o gratuitas.
* Todo el software, herramientas de IA y tecnologías utilizadas deben ser en sus versiones de libre acceso o gratuitas.

## IMPACTOS EN OTRAS ÁREAS ORGANIZACIONALES
* La Dirección de la I.E.P. Wez College deberá coordinar con el equipo ejecutor los horarios de capacitación para garantizar la asistencia de los docentes sin afectar las actividades académicas regulares.
* La implementación del proyecto contribuirá al fortalecimiento de las competencias digitales de los docentes y al proceso de transformación digital de la institución educativa.
* Durante la ejecución del proyecto se requerirá la utilización temporal del laboratorio de cómputo, proyectores multimedia y conexión a internet de la institución.

## IMPACTOS EN OTRAS ENTIDADES: DENTRO O FUERA DE LA ORGANIZACIÓN EJECUTANTE.
* Los estudiantes de la I.E.P. Wez College se beneficiarán indirectamente mediante la aplicación de metodologías innovadoras apoyadas por Inteligencia Artificial en el proceso de enseñanza-aprendizaje.
* La metodología implementada podrá ser replicada en otras instituciones educativas interesadas en la integración responsable de herramientas de Inteligencia Artificial.
* La institución educativa fortalecerá su imagen como organización innovadora en la aplicación responsable de tecnologías emergentes.

## REQUERIMIENTOS DE SOPORTE Y ENTRENAMIENTO
* Se proporcionarán materiales digitales para apoyar el aprendizaje de los participantes, incluyendo presentaciones, recursos descargables y material de autoaprendizaje.
* Se desarrollarán casos de aplicación educativa que permitan a los docentes experimentar el uso pedagógico de las herramientas de Inteligencia Artificial.
* El equipo ejecutor brindará soporte técnico durante las sesiones para resolver incidencias relacionadas con el sitio web y las herramientas empleadas.

## SUPUESTOS RELATIVOS A REQUISITOS
* La I.E.P. Wez College proporcionará oportunamente la relación de docentes participantes para su registro en la plataforma.
* La institución dispone de conexión estable a internet durante todas las sesiones de capacitación.
* Los docentes cuentan con un dispositivo tecnológico (laptop, tablet o smartphone) para desarrollar las actividades prácticas.

## RESTRICCIONES RELATIVAS A REQUISITOS
* Las sesiones de capacitación deberán realizarse únicamente en las fechas establecidas por el cronograma aprobado.
* El costo total del proyecto no podrá exceder el presupuesto aprobado de S/. 290.00.
* El informe final debe entregarse en la fecha establecida sin oportunidad a postergarlo.
* El sistema deberá mantener disponibilidad operativa durante todas las sesiones de capacitación.