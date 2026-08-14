/**
 * Envío de certificados por WhatsApp usando WhatsApp Cloud API de Meta.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 *
 * Requiere (env vars):
 *   WHATSAPP_API_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   WHATSAPP_FROM_NUMBER  (opcional)
 *
 * Si faltan credenciales, la función no falla: marca el envío como FALLIDO
 * y registra el motivo, para que el admin pueda reintentar.
 */
export type SendResult = {
  ok: boolean;
  messageId?: string;
  error?: string;
};

const API_BASE = "https://graph.facebook.com/v19.0";

export async function enviarWhatsappDocumento(
  toNumber: string, // formato internacional, ej. 51987654321
  documentUrl: string, // URL pública del PDF
  filename: string,
  caption: string
): Promise<SendResult> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return {
      ok: false,
      error: "WHATSAPP_API_TOKEN o WHATSAPP_PHONE_NUMBER_ID no configurados",
    };
  }

  const body = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "document",
    document: {
      link: documentUrl,
      filename,
      caption,
    },
  };

  try {
    const res = await fetch(`${API_BASE}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: JSON.stringify(data) };
    }
    const messageId = data?.messages?.[0]?.id;
    return { ok: true, messageId };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  }
}

/** Normaliza un número al formato internacional sin "+" ni espacios. */
export function normalizarNumero(num: string): string {
  let n = num.replace(/[+\s\-()]/g, "");
  if (n.startsWith("51")) return n;
  if (n.startsWith("0")) return "51" + n.slice(1);
  return "51" + n;
}
