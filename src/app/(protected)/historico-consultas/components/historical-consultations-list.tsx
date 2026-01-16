"use client";

import { Search, AlertCircle, MoreVertical, Clock, User } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usePastAppointments } from "@/hooks/queries/use-past-appointments";

interface HistoricalConsultationsListProps {
  clinicId: string;
}

export function HistoricalConsultationsList({
  clinicId,
}: HistoricalConsultationsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, error, isError } = usePastAppointments({
    clinicId,
    page,
    limit: 10,
    search: debouncedSearch || undefined,
  });

  const appointments = data?.appointments || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const handleViewPet = (codigo: string) => {
    router.push(`/consultas/${codigo}`);
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  // Formatar status para exibição
  const getStatusLabel = (status: string | null | undefined) => {
    if (!status) return "Agendado";
    if (status === "CONCLUIDO") return "Concluído";
    if (status === "ATRASADO") return "Atrasado";
    return "Agendado";
  };

  const getStatusBadgeClass = (status: string | null | undefined) => {
    if (status === "CONCLUIDO") {
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
    if (status === "ATRASADO") {
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
                    placeholder="Buscar consultas..."
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
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error?.message || "Erro ao carregar consultas"}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carteirinha</TableHead>
                <TableHead>Nome Pet</TableHead>
                <TableHead>Plano Pet</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                  </TableRow>
                ))
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>Nenhuma consulta passada encontrada</p>
                      {search && (
                        <p className="text-xs">
                          Tente ajustar os filtros de busca
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((appointment) => (
                  <TableRow
                    key={appointment.id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-sm">
                      {appointment.petCodigo || "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {appointment.petName}
                    </TableCell>
                    <TableCell>{appointment.planName || "-"}</TableCell>
                    <TableCell>{formatDate(appointment.appointmentDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(appointment.appointmentTime)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(appointment.priceInCents)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </TableCell>
                    <TableCell>
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
                          <DropdownMenuItem disabled>
                            {appointment.petName}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleViewPet(appointment.petCodigo || "")
                            }
                          >
                            <User className="mr-2 h-4 w-4" />
                            Ver Pet
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages} ({data?.pagination?.total || 0}{" "}
            consultas)
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
  );
}

