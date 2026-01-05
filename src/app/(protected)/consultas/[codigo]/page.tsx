"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, FileText, Syringe, Hospital } from "lucide-react";
import { ClinicGuard } from "../components/clinic-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePetByCode } from "@/hooks/queries/use-pet-by-code";
import { usePlan } from "@/hooks/queries/use-plan";
import { useCurrentUserClinic } from "@/hooks/queries/use-current-user-clinic";
import { MedicalRecordDialog } from "../components/medical-record-dialog";
import { VaccineDialog } from "../components/vaccine-dialog";
import { MedicalRecordsHistory } from "../components/medical-records-history";

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

const getGenderLabel = (gender: string | null | undefined) => {
  if (!gender) return "-";
  return gender === "MACHO" ? "Macho" : "Fêmea";
};

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(dateObj);
};

export default function ConsultaByCodePage() {
  const params = useParams();
  const router = useRouter();
  const codigo = params.codigo as string;
  const [isMedicalRecordOpen, setIsMedicalRecordOpen] = useState(false);
  const [isVaccineOpen, setIsVaccineOpen] = useState(false);

  const { data: pet, isLoading, error } = usePetByCode(codigo);
  const { data: plan, isLoading: isLoadingPlan } = usePlan(pet?.planId || "");
  const { data: clinicData } = useCurrentUserClinic();

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

  if (error || !pet) {
    return (
      <ClinicGuard>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/consultas")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">
                {error?.message || "Pet não encontrado"}
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
          <Button
            variant="ghost"
            onClick={() => router.push("/consultas")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Informações do Pet</h1>
          <p className="text-muted-foreground mt-2">
            Carteirinha: {pet.codigo || "-"}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="text-lg font-semibold">{pet.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Espécie</p>
                <p className="text-lg">{getSpeciesLabel(pet.species)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Raça</p>
                <p className="text-lg">{pet.breed || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gênero</p>
                <p className="text-lg">{getGenderLabel(pet.gender)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Data de Nascimento
                </p>
                <p className="text-lg">{formatDate(pet.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                    pet.status === "ATIVO"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {pet.status === "ATIVO" ? "Ativo" : "Suspenso"}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Carteirinha
                </p>
                <p className="text-lg font-mono">{pet.codigo || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Plano
                </p>
                {isLoadingPlan ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <p className="text-lg">{plan?.name || "-"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 min-w-[200px]"
            onClick={() => setIsMedicalRecordOpen(true)}
          >
            <FileText className="h-5 w-5 mr-2" />
            Prontuário
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 min-w-[200px]"
            onClick={() => setIsVaccineOpen(true)}
          >
            <Syringe className="h-5 w-5 mr-2" />
            Vacinas
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 min-w-[200px]"
            onClick={() => {
              // TODO: Implementar navegação para Internações
              console.log("Internações do pet:", pet.id);
            }}
          >
            <Hospital className="h-5 w-5 mr-2" />
            Internações
          </Button>
        </div>

        {pet && <MedicalRecordsHistory petId={pet.id} />}

        {pet && clinicData?.clinic && (
          <>
            <MedicalRecordDialog
              open={isMedicalRecordOpen}
              onOpenChange={setIsMedicalRecordOpen}
              petId={pet.id}
              petName={pet.name}
              clinicId={clinicData.clinic.id}
            />
            <VaccineDialog
              open={isVaccineOpen}
              onOpenChange={setIsVaccineOpen}
              petId={pet.id}
              petName={pet.name}
            />
          </>
        )}
      </div>
    </ClinicGuard>
  );
}

