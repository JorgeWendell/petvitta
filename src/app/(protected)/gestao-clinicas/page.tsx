import { AdminGuard } from "./components/admin-guard";
import { ClinicsList } from "./components/clinics-list";

export default function GestaoClinicasPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão de Clínicas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as clínicas credenciadas no sistema
          </p>
        </div>
        <ClinicsList />
      </div>
    </AdminGuard>
  );
}

