export const dynamic = "force-dynamic";
import { getSession } from "@/lib/auth";

export default async function AdminMaterialesPage() {
  await getSession();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Materiales</h1>
      <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
        <span className="text-3xl">📁</span>
        <p className="text-slate-600">Aquí se gestionarán los recursos y materiales del programa.</p>
        <p className="text-sm text-slate-400">Sección en preparación.</p>
      </div>
    </div>
  );
}
