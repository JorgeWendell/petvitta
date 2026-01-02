import { AdminGuard } from "./components/admin-guard";
import { PetsList } from "./components/pets-list";

export default function GestaoPetsPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão de Pets</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os pets cadastrados no sistema
          </p>
        </div>
        <PetsList />
      </div>
    </AdminGuard>
  );
}

