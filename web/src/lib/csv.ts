/** Convierte un array de registros a CSV descargable. */
export function toCsv(rows: Record<string, any>[], headers?: string[]): string {
  if (rows.length === 0) return headers ? headers.join(",") : "";
  const keys = headers ?? Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v == null ? "" : String(v);
    return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = keys.join(",");
  const body = rows.map((r) => keys.map((k) => escape(r[k])).join(",")).join("\n");
  return `${head}\n${body}`;
}
