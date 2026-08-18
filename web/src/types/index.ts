export type Participante = {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  whatsapp: string;
  creado_en: string;
};

export type Sesion = {
  id: string;
  nombre: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export type Asistencia = {
  id: string;
  participante_id: string;
  sesion_id: string;
  registrado_en: string;
};

export type Certificado = {
  id: string;
  participante_id: string;
  codigo_verif: string;
  porcentaje: number;
  generado_en: string;
  storage_path: string | null;
};

export type EnvioWhatsapp = {
  id: string;
  certificado_id: string;
  estado: "PENDIENTE" | "ENVIADO" | "FALLIDO";
  intentos: number;
  respuesta_api: string | null;
  enviado_en: string | null;
};

export type Parametros = {
  umbral_asistencia_min: string;
  mensaje_whatsapp: string;
  programa_fechas: string;
};

export type Taller = {
  id: string;
  session_id: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

export type Material = {
  id: string;
  taller_id: string;
  nombre: string;
  descripcion: string | null;
  nombre_archivo: string;
  mime_type: string;
  bytes: number;
  storage_path: string;
  creado_en: string;
};
