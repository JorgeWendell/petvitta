import { AdminGuard } from "./components/admin-guard";
import { PlansList } from "./components/plans-list";

export default function GestaoPlanosPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão de Planos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os planos disponíveis no sistema
          </p>
        </div>
        <PlansList />
      </div>
    </AdminGuard>
  );
}

