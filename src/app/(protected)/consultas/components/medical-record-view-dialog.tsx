"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMedicalRecordAction } from "@/actions/get-medical-record";
import { toast } from "sonner";

interface MedicalRecordViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicalRecordId: string;
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

const getMucosaLabel = (mucosa: string | null | undefined) => {
  if (!mucosa) return "-";
  const labels: Record<string, string> = {
    NORMAL: "Normais",
    PALIDA: "Pálidas",
    ICTERICA: "Ictéricas",
  };
  return labels[mucosa] || mucosa;
};

const getHydrationLabel = (hydration: string | null | undefined) => {
  if (!hydration) return "-";
  const labels: Record<string, string> = {
    NORMAL: "Normal",
    DESIDRATADO: "Desidratado",
  };
  return labels[hydration] || hydration;
};

export function MedicalRecordViewDialog({
  open,
  onOpenChange,
  medicalRecordId,
}: MedicalRecordViewDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);

  useEffect(() => {
    if (open && medicalRecordId) {
      loadMedicalRecord();
    }
  }, [open, medicalRecordId]);

  const loadMedicalRecord = async () => {
    try {
      setIsLoading(true);
      const result = await getMedicalRecordAction({ medicalRecordId });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        toast.error("Erro de validação");
        return;
      }

      if (result.data?.error) {
        toast.error(result.data.error);
        return;
      }

      if (result.data?.medicalRecord) {
        setMedicalRecord(result.data.medicalRecord);
      }
    } catch (error) {
      console.error("Erro ao carregar prontuário:", error);
      toast.error("Erro ao carregar prontuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Visualizar Prontuário
          </DialogTitle>
          <DialogDescription>
            Detalhes do prontuário médico
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : medicalRecord ? (
          <Tabs defaultValue="anamnese" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
              <TabsTrigger value="diagnostico">Diagnóstico</TabsTrigger>
            </TabsList>

            <TabsContent value="anamnese" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Anamnese</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Clínica
                    </p>
                    <p className="text-lg">{medicalRecord.clinicName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Veterinário
                    </p>
                    <p className="text-lg">{medicalRecord.doctorName || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Data da Consulta
                    </p>
                    <p className="text-lg">
                      {formatDate(medicalRecord.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Retorno
                    </p>
                    <p className="text-lg">
                      {medicalRecord.isReturn ? "Sim" : "Não"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Queixa Principal
                    </p>
                    <p className="text-lg">
                      {medicalRecord.chiefComplaint || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Sintomas Relatados
                    </p>
                    <p className="text-lg whitespace-pre-wrap">
                      {medicalRecord.reportedSymptoms || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Uso de Medicamentos
                    </p>
                    <p className="text-lg whitespace-pre-wrap">
                      {medicalRecord.medicationUse || "-"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Temperatura (°C)
                      </p>
                      <p className="text-lg">
                        {medicalRecord.temperature
                          ? `${medicalRecord.temperature}°C`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Frequência Cardíaca (bpm)
                      </p>
                      <p className="text-lg">
                        {medicalRecord.heartRate
                          ? `${medicalRecord.heartRate} bpm`
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Frequência Respiratória (irpm)
                      </p>
                      <p className="text-lg">
                        {medicalRecord.respiratoryRate
                          ? `${medicalRecord.respiratoryRate} irpm`
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Mucosas
                      </p>
                      <p className="text-lg">
                        {getMucosaLabel(medicalRecord.mucosa)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Hidratação
                      </p>
                      <p className="text-lg">
                        {getHydrationLabel(medicalRecord.hydration)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostico" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Diagnóstico Clínico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg whitespace-pre-wrap">
                    {medicalRecord.clinicalDiagnosis || "-"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prescrição / Tratamento</CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalRecord.prescriptions?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma prescrição registrada
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecord.prescriptions?.map(
                        (prescription: any, index: number) => (
                          <Card key={prescription.id}>
                            <CardContent className="pt-6">
                              <h4 className="font-medium mb-4">
                                Prescrição {index + 1}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Medicamento
                                  </p>
                                  <p className="text-lg">
                                    {prescription.medication}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Dosagem
                                  </p>
                                  <p className="text-lg">{prescription.dosage}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Frequência
                                  </p>
                                  <p className="text-lg">
                                    {prescription.frequency}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Duração
                                  </p>
                                  <p className="text-lg">
                                    {prescription.duration}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exames Solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalRecord.exams?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum exame registrado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecord.exams?.map((exam: any, index: number) => (
                        <Card key={exam.id}>
                          <CardContent className="pt-6">
                            <h4 className="font-medium mb-4">Exame {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Nome do Exame
                                </p>
                                <p className="text-lg">{exam.examName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Resultado
                                </p>
                                <p className="text-lg">{exam.result || "-"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Data
                                </p>
                                <p className="text-lg">
                                  {exam.examDate
                                    ? formatDate(exam.examDate)
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Vacinas</CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalRecord.vaccines?.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma vacina registrada
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {medicalRecord.vaccines?.map((vaccine: any, index: number) => (
                        <Card key={vaccine.id}>
                          <CardContent className="pt-6">
                            <h4 className="font-medium mb-4">Vacina {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Nome
                                </p>
                                <p className="text-lg">{vaccine.vaccineName}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Dose
                                </p>
                                <p className="text-lg">{vaccine.dose}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Data
                                </p>
                                <p className="text-lg">
                                  {vaccine.vaccineDate
                                    ? formatDate(vaccine.vaccineDate)
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                  Próxima Dose (data)
                                </p>
                                <p className="text-lg">
                                  {vaccine.nextDoseDate
                                    ? formatDate(vaccine.nextDoseDate)
                                    : "-"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum dado disponível
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

