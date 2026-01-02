import { AdminGuard } from "./components/admin-guard";
import { ReportsTabs } from "./components/reports-tabs";

export default function GestaoRelatoriosPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Visualize relatórios de uso e faturamento
          </p>
        </div>
        <ReportsTabs />
      </div>
    </AdminGuard>
  );
}

