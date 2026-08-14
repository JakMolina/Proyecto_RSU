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
  taller_numero: number;
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
