"use client";

import { Edit, Plus, Search, Trash2, AlertCircle, MoreVertical } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

import { useDoctors } from "@/hooks/queries/use-doctors";
import { useDeleteDoctor } from "@/hooks/mutations/use-delete-doctor";

import { DoctorFormDialog } from "./doctor-form-dialog";

type Doctor = {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  availableFromWeekDay: number;
  availableToWeekDay: number;
  availableFromTime: string;
  availableToTime: string;
  avatarImageUrl?: string | null;
  appointmentPriceInCents: number;
  createdAt: Date;
  updatedAt: Date;
};

interface DoctorsListProps {
  clinicId: string;
}

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
};

const formatDaysRange = (fromDay: number, toDay: number) => {
  if (fromDay === toDay) {
    return weekDays[fromDay];
  }
  return `${weekDays[fromDay]} a ${weekDays[toDay]}`;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function DoctorsList({ clinicId }: DoctorsListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteDoctorId, setDeleteDoctorId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error, isError } = useDoctors({
    clinicId,
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const deleteDoctorMutation = useDeleteDoctor();

  const handleDelete = (id: string) => {
    setDeleteDoctorId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteDoctorId) {
      deleteDoctorMutation.mutate(
        { id: deleteDoctorId, clinicId },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setDeleteDoctorId(null);
          },
        }
      );
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingDoctor(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingDoctor(null);
  };

  const doctors = data?.doctors || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 max-w-md">
          <FieldGroup>
            <Field>
              <FieldContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou e-mail..."
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
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Novo Veterinário
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error?.message || "Erro ao carregar veterinários"}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <p>Nenhum veterinário encontrado</p>
            {search && (
              <p className="text-xs">
                Tente ajustar os filtros de busca
              </p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="h-16 w-16 shrink-0">
                        {doctor.avatarImageUrl ? (
                          <AvatarImage
                            src={doctor.avatarImageUrl}
                            alt={doctor.name}
                          />
                        ) : null}
                        <AvatarFallback className="text-lg">
                          {getInitials(doctor.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {doctor.name}
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {formatDaysRange(
                              doctor.availableFromWeekDay,
                              doctor.availableToWeekDay
                            )}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                            {formatTime(doctor.availableFromTime)} às{" "}
                            {formatTime(doctor.availableToTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="h-8 w-8 shrink-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(doctor)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(doctor.id)}
                          className="text-destructive"
                          disabled={deleteDoctorMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages} ({data?.pagination?.total || 0}{" "}
                veterinários)
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
        </>
      )}

      <DoctorFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        doctor={editingDoctor}
        clinicId={clinicId}
        onSuccess={handleDialogClose}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veterinário? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteDoctorMutation.isPending}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteDoctorMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteDoctorMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

