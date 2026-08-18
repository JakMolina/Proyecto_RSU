export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function imagenABase64(ruta: string): string {
  const ext = path.extname(ruta).toLowerCase();
  let mime = "image/png";
  if (ext === ".jpg" || ext === ".jpeg") mime = "image/jpeg";
  if (ext === ".webp") mime = "image/webp";
  const base64 = fs.readFileSync(ruta).toString("base64");
  return `data:${mime};base64,${base64}`;
}

export async function GET() {
  try {
    const uncPath = path.join(PUBLIC_DIR, "certificado-unc.png");
    const pmiPath = path.join(PUBLIC_DIR, "certificado-pmi.png");
    
    const uncExists = fs.existsSync(uncPath);
    const pmiExists = fs.existsSync(pmiPath);
    
    let uncBase64 = "";
    let pmiBase64 = "";
    
    if (uncExists) {
      uncBase64 = imagenABase64(uncPath);
    }
    if (pmiExists) {
      pmiBase64 = imagenABase64(pmiPath);
    }
    
    return NextResponse.json({
      uncExists,
      pmiExists,
      uncBase64Length: uncBase64.length,
      pmiBase64Length: pmiBase64.length,
      uncPreview: uncBase64.substring(0, 100),
      pmiPreview: pmiBase64.substring(0, 100),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}