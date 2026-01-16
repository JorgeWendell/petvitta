"use client";

import { Edit, Plus, Search, Trash2, AlertCircle, MoreVertical, History } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { usePets } from "@/hooks/queries/use-pets";
import { useDeletePet } from "@/hooks/mutations/use-delete-pet";
import { useUsers } from "@/hooks/queries/use-users";

import { PetFormDialog } from "./pet-form-dialog";

type Pet = {
  id: string;
  codigo?: string | null;
  name: string;
  species: "CÃO" | "GATO" | "PASSARO" | "COELHO" | "HAMSTER" | "OUTRO";
  breed?: string | null;
  dateOfBirth?: string | null;
  gender?: "MACHO" | "FÊMEA" | null;
  status: "ATIVO" | "SUSPENSO";
  tutorId: string;
  planId?: string | null;
  createdAt: Date;
};

export function PetsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ATIVO" | "SUSPENSO" | undefined
  >(undefined);
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deletePetId, setDeletePetId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error, isError } = usePets({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    status: statusFilter,
  });

  // Buscar todos os tutores para exibir nomes
  const { data: tutorsData } = useUsers({ role: "TUTOR", limit: 100 });
  const tutors = tutorsData?.users || [];
  const tutorsMap = new Map(tutors.map((tutor) => [tutor.id, tutor.name]));

  const deletePetMutation = useDeletePet();

  const handleDelete = (id: string) => {
    setDeletePetId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletePetId) {
      deletePetMutation.mutate(
        { id: deletePetId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setDeletePetId(null);
          },
        }
      );
    }
  };

  const handleEdit = (pet: Pet) => {
    setEditingPet(pet);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPet(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPet(null);
  };

  const getSpeciesLabel = (species: string) => {
    const labels = {
      CÃO: "Cão",
      GATO: "Gato",
      PASSARO: "Pássaro",
      COELHO: "Coelho",
      HAMSTER: "Hamster",
      OUTRO: "Outro",
    };
    return labels[species as keyof typeof labels] || species;
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "ATIVO"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const pets = data?.pets || [];
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
                    placeholder="Buscar por nome..."
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
                        ? (e.target.value as "ATIVO" | "SUSPENSO")
                        : undefined
                    );
                    setPage(1);
                  }}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                >
                  <option value="">Todos os status</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="SUSPENSO">Suspenso</option>
                </select>
              </FieldContent>
            </Field>
          </FieldGroup>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Novo Pet
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error?.message || "Erro ao carregar pets"}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Carteirinha
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Tutor
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Espécie
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Raça
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Ações
                </th>
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
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))
              ) : pets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>Nenhum pet encontrado</p>
                      {search && (
                        <p className="text-xs">
                          Tente ajustar os filtros de busca
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                pets.map((pet) => (
                  <tr
                    key={pet.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-mono text-sm">
                      {pet.codigo || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">{pet.name}</td>
                    <td className="px-4 py-3">
                      {tutorsMap.get(pet.tutorId) || "-"}
                    </td>
                    <td className="px-4 py-3">{getSpeciesLabel(pet.species)}</td>
                    <td className="px-4 py-3">{pet.breed || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeColor(
                          pet.status
                        )}`}
                      >
                        {pet.status === "ATIVO" ? "Ativo" : "Suspenso"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                              <p className="text-sm font-medium leading-none">
                                {pet.name}
                              </p>
                              <p className="text-xs leading-none text-muted-foreground">
                                {getSpeciesLabel(pet.species)}
                              </p>
                            </div>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(pet)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(pet.id)}
                            disabled={deletePetMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="mr-2 h-4 w-4" />
                            Histórico
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Página {page} de {totalPages} ({data?.pagination?.total || 0}{" "}
              pets)
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

      <PetFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        pet={editingPet}
        onSuccess={handleDialogClose}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pet? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePetMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletePetMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePetMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

