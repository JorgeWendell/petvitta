import { AdminGuard } from "./components/admin-guard";
import { SubscriptionsList } from "./components/subscriptions-list";

export default function GestaoFinanceiroPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão Financeira</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie assinaturas e pagamentos
          </p>
        </div>
        <SubscriptionsList />
      </div>
    </AdminGuard>
  );
}

