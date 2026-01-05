"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Plus, Trash2, Loader2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Field, FieldGroup } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createMedicalRecordAction } from "@/actions/create-medical-record";
import { useDoctors } from "@/hooks/queries/use-doctors";

const anamneseSchema = z.object({
  chiefComplaint: z.string().optional(),
  reportedSymptoms: z.string().optional(),
  medicationUse: z.string().optional(),
  temperature: z.string().optional(),
  heartRate: z.string().optional(),
  respiratoryRate: z.string().optional(),
  mucosa: z.enum(["NORMAL", "PALIDA", "ICTERICA"]).optional(),
  hydration: z.enum(["NORMAL", "DESIDRATADO"]).optional(),
});

const prescriptionSchema = z.object({
  medication: z.string().min(1, "Medicamento é obrigatório"),
  dosage: z.string().min(1, "Dosagem é obrigatória"),
  frequency: z.string().min(1, "Frequência é obrigatória"),
  duration: z.string().min(1, "Duração é obrigatória"),
});

const examSchema = z.object({
  examName: z.string().min(1, "Nome do exame é obrigatório"),
  result: z.string().optional(),
  examDate: z.string().optional(),
});

const vaccineSchema = z.object({
  vaccineName: z.string().min(1, "Nome da vacina é obrigatório"),
  dose: z.string().min(1, "Dose é obrigatória"),
  vaccineDate: z.string().min(1, "Data é obrigatória"),
  nextDoseDate: z.string().optional(),
});

const medicalRecordSchema = z.object({
  anamnese: anamneseSchema,
  clinicalDiagnosis: z.string().optional(),
  isReturn: z.boolean().default(false),
  prescriptions: z.array(prescriptionSchema).default([]),
  exams: z.array(examSchema).default([]),
  vaccines: z.array(vaccineSchema).default([]),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

interface MedicalRecordFormProps {
  petId: string;
  clinicId: string;
}

export function MedicalRecordForm({ petId, clinicId }: MedicalRecordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: doctorsData } = useDoctors({ clinicId, limit: 100 });
  const doctors = doctorsData?.doctors || [];

  const form = useForm<MedicalRecordFormData & { doctorId: string }>({
    resolver: zodResolver(
      medicalRecordSchema.extend({
        doctorId: z.string().min(1, "Médico é obrigatório"),
      })
    ),
    defaultValues: {
      doctorId: doctors.length > 0 ? doctors[0].id : "",
      anamnese: {
        chiefComplaint: "",
        reportedSymptoms: "",
        medicationUse: "",
        temperature: "",
        heartRate: "",
        respiratoryRate: "",
        mucosa: undefined,
        hydration: undefined,
      },
      clinicalDiagnosis: "",
      isReturn: false,
      prescriptions: [],
      exams: [],
      vaccines: [],
    },
  });

  const {
    fields: prescriptionFields,
    append: appendPrescription,
    remove: removePrescription,
  } = useFieldArray({
    control: form.control,
    name: "prescriptions",
  });

  const {
    fields: examFields,
    append: appendExam,
    remove: removeExam,
  } = useFieldArray({
    control: form.control,
    name: "exams",
  });

  const {
    fields: vaccineFields,
    append: appendVaccine,
    remove: removeVaccine,
  } = useFieldArray({
    control: form.control,
    name: "vaccines",
  });

  const onSubmit = async (data: MedicalRecordFormData & { doctorId: string }) => {
    try {
      setIsLoading(true);

      const result = await createMedicalRecordAction({
        petId,
        doctorId: data.doctorId,
        anamnese: data.anamnese,
        clinicalDiagnosis: data.clinicalDiagnosis || "",
        isReturn: data.isReturn,
        prescriptions: data.prescriptions,
        exams: data.exams,
        vaccines: data.vaccines,
      });

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

      toast.success("Prontuário salvo com sucesso!");
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar prontuário:", error);
      toast.error("Erro ao salvar prontuário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field>
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico Responsável</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isLoading || doctors.length === 0}
                      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                    >
                      {doctors.length === 0 ? (
                        <option value="">Nenhum médico disponível</option>
                      ) : (
                        doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </option>
                        ))
                      )}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Field>

          <Field>
            <FormField
              control={form.control}
              name="isReturn"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Retorno</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Marque se esta é uma consulta de retorno
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Field>
        </div>

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
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FormField
                      control={form.control}
                      name="anamnese.chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Queixa Principal</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Descreva a queixa principal"
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>

                  <Field>
                    <FormField
                      control={form.control}
                      name="anamnese.reportedSymptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sintomas Relatados</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              placeholder="Descreva os sintomas relatados"
                              disabled={isLoading}
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>

                  <Field>
                    <FormField
                      control={form.control}
                      name="anamnese.medicationUse"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Uso de Medicamentos</FormLabel>
                          <FormControl>
                            <textarea
                              {...field}
                              placeholder="Liste os medicamentos em uso"
                              disabled={isLoading}
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field>
                      <FormField
                        control={form.control}
                        name="anamnese.temperature"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Temperatura (°C)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.1"
                                placeholder="Ex: 38.5"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>

                    <Field>
                      <FormField
                        control={form.control}
                        name="anamnese.heartRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência Cardíaca (bpm)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Ex: 120"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>

                    <Field>
                      <FormField
                        control={form.control}
                        name="anamnese.respiratoryRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência Respiratória (irpm)</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Ex: 30"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <FormField
                        control={form.control}
                        name="anamnese.mucosa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mucosas</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                disabled={isLoading}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                              >
                                <option value="">Selecione</option>
                                <option value="NORMAL">Normais</option>
                                <option value="PALIDA">Pálidas</option>
                                <option value="ICTERICA">Ictéricas</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>

                    <Field>
                      <FormField
                        control={form.control}
                        name="anamnese.hydration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hidratação</FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                disabled={isLoading}
                                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                              >
                                <option value="">Selecione</option>
                                <option value="NORMAL">Normal</option>
                                <option value="DESIDRATADO">Desidratado</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostico" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico Clínico</CardTitle>
              </CardHeader>
              <CardContent>
                <Field>
                  <FormField
                    control={form.control}
                    name="clinicalDiagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico Clínico</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            placeholder="Descreva o diagnóstico clínico"
                            disabled={isLoading}
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prescrição / Tratamento</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendPrescription({
                        medication: "",
                        dosage: "",
                        frequency: "",
                        duration: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptionFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma prescrição adicionada
                    </p>
                  ) : (
                    prescriptionFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Prescrição {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removePrescription(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`prescriptions.${index}.medication`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medicamento</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Nome do medicamento"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`prescriptions.${index}.dosage`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dosagem</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Ex: 10mg"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`prescriptions.${index}.frequency`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Frequência</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Ex: 2x ao dia"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`prescriptions.${index}.duration`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duração</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Ex: 7 dias"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Exames Solicitados</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendExam({
                        examName: "",
                        result: "",
                        examDate: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {examFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum exame adicionado
                    </p>
                  ) : (
                    examFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Exame {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExam(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name={`exams.${index}.examName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do Exame</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Nome do exame"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`exams.${index}.result`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Resultado</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Resultado do exame"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`exams.${index}.examDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="date"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vacinas</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendVaccine({
                        vaccineName: "",
                        dose: "",
                        vaccineDate: "",
                        nextDoseDate: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vaccineFields.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma vacina adicionada
                    </p>
                  ) : (
                    vaccineFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Vacina {index + 1}</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVaccine(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`vaccines.${index}.vaccineName`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Nome da vacina"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`vaccines.${index}.dose`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dose</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Ex: 1ª dose"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`vaccines.${index}.vaccineDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="date"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`vaccines.${index}.nextDoseDate`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Próxima Dose (data)</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="date"
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar Prontuário
          </Button>
        </div>
      </form>
    </Form>
  );
}

