"use client";

import { Plus, Search, AlertCircle, MoreVertical, Calendar, Clock, X, CalendarDays } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

import { AppointmentFormDialog } from "./appointment-form-dialog";
import { useAppointments } from "@/hooks/queries/use-appointments";
import { useDeleteAppointment } from "@/hooks/mutations/use-delete-appointment";

interface AppointmentsListProps {
  clinicId: string;
}

export function AppointmentsList({ clinicId }: AppointmentsListProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error, isError } = useAppointments({
    clinicId,
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const deleteAppointmentMutation = useDeleteAppointment();

  const appointments = data?.appointments || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleCreate = () => {
    setSelectedAppointment(null);
    setIsDialogOpen(true);
  };

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDialogOpen(true);
  };

  const handleCancel = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (!selectedAppointment) return;

    deleteAppointmentMutation.mutate(
      {
        id: selectedAppointment.id,
        clinicId,
      },
      {
        onSuccess: () => {
          setIsCancelDialogOpen(false);
          setSelectedAppointment(null);
        },
      }
    );
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
  };

  // Formatar hora para exibição
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
  };

  // Formatar valor para exibição
  const formatPrice = (priceInCents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInCents / 100);
  };

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
                    placeholder="Buscar agendamentos..."
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
          Novo Agendamento
        </Button>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error?.message || "Erro ao carregar agendamentos"}
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
                  Nome Pet
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Plano Pet
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Hora
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Valor
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
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>Nenhum agendamento encontrado</p>
                      {search && (
                        <p className="text-xs">
                          Tente ajustar os filtros de busca
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-mono text-sm">
                      {appointment.petCodigo || "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {appointment.petName}
                    </td>
                    <td className="px-4 py-3">
                      {appointment.planName || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(appointment.appointmentDate)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(appointment.appointmentTime)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(appointment.priceInCents)}
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
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem disabled>
                            {appointment.petName}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReschedule(appointment)}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            Reagendar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCancel(appointment)}
                            className="text-destructive"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Cancelar
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
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({data?.pagination?.total || 0}{" "}
            agendamentos)
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

      <AppointmentFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
        clinicId={clinicId}
        onSuccess={() => {
          setIsDialogOpen(false);
          setSelectedAppointment(null);
        }}
      />

      <AlertDialog
        open={isCancelDialogOpen}
        onOpenChange={(open) => {
          setIsCancelDialogOpen(open);
          if (!open) {
            setSelectedAppointment(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cancelamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAppointmentMutation.isPending}>
              Não cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              disabled={deleteAppointmentMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAppointmentMutation.isPending ? "Cancelando..." : "Cancelar agendamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

