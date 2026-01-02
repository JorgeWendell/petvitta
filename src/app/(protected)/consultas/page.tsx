"use client";

import { ClinicGuard } from "./components/clinic-guard";
import { ConsultationsList } from "./components/consultations-list";
import { useCurrentUserClinic } from "@/hooks/queries/use-current-user-clinic";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

export default function ConsultasPage() {
  const { data, isLoading, error } = useCurrentUserClinic();

  if (isLoading) {
    return (
      <ClinicGuard>
        <div className="container mx-auto py-8">
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </ClinicGuard>
    );
  }

  if (error || !data?.clinic) {
    return (
      <ClinicGuard>
        <div className="container mx-auto py-8">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                {error?.message || "Erro ao carregar informações da clínica"}
              </p>
            </div>
          </div>
        </div>
      </ClinicGuard>
    );
  }

  return (
    <ClinicGuard>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Consultas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as consultas da sua clínica
          </p>
        </div>
        <ConsultationsList clinicId={data.clinic.id} />
      </div>
    </ClinicGuard>
  );
}

