import { AdminGuard } from "./components/admin-guard";
import { UsersList } from "./components/users-list";

export default function GestaoUsuariosPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários do sistema (Administradores, Clínicas e Tutores)
          </p>
        </div>
        <UsersList />
      </div>
    </AdminGuard>
  );
}

