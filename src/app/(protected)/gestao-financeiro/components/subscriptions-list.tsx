"use client";

import { Edit, Plus, Search, Trash2, AlertCircle } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useSubscriptions } from "@/hooks/queries/use-subscriptions";
import { useDeleteSubscription } from "@/hooks/mutations/use-delete-subscription";
import { usePets } from "@/hooks/queries/use-pets";
import { usePlans } from "@/hooks/queries/use-plans";

import { SubscriptionFormDialog } from "./subscription-form-dialog";

type Subscription = {
  id: string;
  petId: string;
  planId: string;
  status: "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA";
  startDate: Date;
  endDate?: Date | null;
  nextBillingDate?: Date | null;
  asaasSubscriptionId?: string | null;
  createdAt: Date;
};

export function SubscriptionsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA" | undefined
  >(undefined);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deleteSubscriptionId, setDeleteSubscriptionId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error, isError } = useSubscriptions({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter,
  });

  // Buscar pets e planos para exibir nomes
  const { data: petsData } = usePets({ limit: 100 });
  const pets = petsData?.pets || [];
  const petsMap = new Map(pets.map((pet) => [pet.id, pet.name]));

  const { data: plansData } = usePlans({ limit: 100 });
  const plans = plansData?.plans || [];
  const plansMap = new Map(plans.map((plan) => [plan.id, plan.name]));

  const deleteSubscriptionMutation = useDeleteSubscription();

  const handleDelete = (id: string) => {
    setDeleteSubscriptionId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteSubscriptionId) {
      deleteSubscriptionMutation.mutate(
        { id: deleteSubscriptionId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setDeleteSubscriptionId(null);
          },
        }
      );
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingSubscription(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSubscription(null);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ATIVA":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CANCELADA":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "SUSPENSA":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "EXPIRADA":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ATIVA: "Ativa",
      CANCELADA: "Cancelada",
      SUSPENSA: "Suspensa",
      EXPIRADA: "Expirada",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const subscriptions = data?.subscriptions || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid flex-1 grid-cols-[2.5fr_1fr] gap-2">
          <FieldGroup>
            <Field>
              <FieldContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome do pet..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </FieldContent>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <FieldContent>
                <select
                  value={statusFilter || ""}
                  onChange={(e) => {
                    setStatusFilter(
                      e.target.value
                        ? (e.target.value as "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA")
                        : undefined
                    );
                    setPage(1);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Todos os status</option>
                  <option value="ATIVA">Ativa</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="SUSPENSA">Suspensa</option>
                  <option value="EXPIRADA">Expirada</option>
                </select>
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nova Assinatura
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error?.message || "Erro ao carregar assinaturas"}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Pet</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plano</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Início</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Término</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Próxima cobrança</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Asaas ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>Nenhuma assinatura encontrada</p>
                      {search && (
                        <p className="text-xs">Tente ajustar os filtros de busca</p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {petsMap.get(subscription.petId) || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {plansMap.get(subscription.planId) || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                          subscription.status
                        )}`}
                      >
                        {getStatusLabel(subscription.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(subscription.startDate)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(subscription.endDate)}</td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(subscription.nextBillingDate)}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">
                      {subscription.asaasSubscriptionId || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEdit(subscription)}
                          title="Editar assinatura"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(subscription.id)}
                          disabled={deleteSubscriptionMutation.isPending}
                          title="Excluir assinatura"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Página {page} de {totalPages} ({data?.pagination?.total || 0} assinaturas)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      <SubscriptionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        subscription={editingSubscription}
        onSuccess={handleDialogClose}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta assinatura? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSubscriptionMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteSubscriptionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSubscriptionMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

