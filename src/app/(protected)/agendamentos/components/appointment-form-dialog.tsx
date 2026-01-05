"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { NumericFormat } from "react-number-format";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldGroup, FieldDescription } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateAppointment } from "@/hooks/mutations/use-create-appointment";
import { useDoctors } from "@/hooks/queries/use-doctors";
import { getPetByCodeAction } from "@/actions/get-pet-by-code";

const appointmentFormSchema = z.object({
  petCodigo: z
    .string()
    .min(1, { message: "Código do pet é obrigatório" })
    .trim(),
  doctorId: z.string().min(1, { message: "Veterinário é obrigatório" }),
  appointmentDate: z.string().min(1, { message: "Data é obrigatória" }),
  appointmentTime: z.string().min(1, { message: "Horário é obrigatório" }),
  priceInCents: z.number().min(0, { message: "Valor deve ser positivo" }),
});

type AppointmentFormData = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinicId: string;
  onSuccess?: () => void;
}

// Gerar opções de horário baseado no intervalo disponível
const generateTimeOptions = (fromTime: string, toTime: string) => {
  const times: string[] = [];
  
  // Converter strings de tempo para minutos do dia
  const fromMinutes = timeToMinutes(fromTime);
  const toMinutes = timeToMinutes(toTime);
  
  // Gerar intervalos de 30 minutos
  for (let minutes = fromMinutes; minutes < toMinutes; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:00`;
    times.push(timeString);
  }
  
  return times;
};

// Converter tempo HH:MM:SS para minutos do dia
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

// Verificar se uma data está dentro dos dias da semana disponíveis
const isDateAvailable = (dateString: string, fromWeekDay: number, toWeekDay: number): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  
  // Se fromWeekDay <= toWeekDay (ex: Segunda a Sexta = 1 a 5)
  if (fromWeekDay <= toWeekDay) {
    return dayOfWeek >= fromWeekDay && dayOfWeek <= toWeekDay;
  }
  // Se fromWeekDay > toWeekDay (ex: Sexta a Domingo = 5 a 0)
  else {
    return dayOfWeek >= fromWeekDay || dayOfWeek <= toWeekDay;
  }
};

// Função para obter nome do dia da semana
const getWeekDayName = (day: number): string => {
  const days = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  return days[day] || "";
};

export function AppointmentFormDialog({
  open,
  onOpenChange,
  clinicId,
  onSuccess,
}: AppointmentFormDialogProps) {
  const createAppointmentMutation = useCreateAppointment();
  const [isValidatingPet, setIsValidatingPet] = useState(false);
  const [petValidationStatus, setPetValidationStatus] = useState<"idle" | "valid" | "invalid">("idle");
  const [petInfo, setPetInfo] = useState<{ name: string } | null>(null);
  
  // Buscar veterinários da clínica
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors({
    clinicId,
    limit: 100,
  });
  const doctors = doctorsData?.doctors || [];

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      petCodigo: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      priceInCents: 0,
    },
  });

  const petCodigo = form.watch("petCodigo");

  // Validar código do pet quando o usuário sair do campo
  const validatePetCode = async (codigo: string): Promise<boolean> => {
    if (!codigo || codigo.trim() === "") {
      setPetValidationStatus("idle");
      setPetInfo(null);
      return false;
    }

    setIsValidatingPet(true);
    setPetValidationStatus("idle");

    try {
      const result = await getPetByCodeAction({ codigo: codigo.trim() });

      if (result?.serverError || result?.validationErrors) {
        setPetValidationStatus("invalid");
        setPetInfo(null);
        form.setError("petCodigo", {
          type: "manual",
          message: "Erro ao validar código",
        });
        return false;
      }

      if (result?.data?.error || !result?.data?.pet) {
        setPetValidationStatus("invalid");
        setPetInfo(null);
        form.setError("petCodigo", {
          type: "manual",
          message: "Código da carteirinha não encontrado",
        });
        return false;
      }

      const pet = result.data.pet;
      setPetValidationStatus("valid");
      setPetInfo({ name: pet.name });
      form.clearErrors("petCodigo");
      return true;
    } catch (error) {
      console.error("Erro ao validar código do pet:", error);
      setPetValidationStatus("invalid");
      setPetInfo(null);
      form.setError("petCodigo", {
        type: "manual",
        message: "Erro ao validar código",
      });
      return false;
    } finally {
      setIsValidatingPet(false);
    }
  };

  const selectedDoctorId = form.watch("doctorId");
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const appointmentDate = form.watch("appointmentDate");

  // Gerar opções de horário baseado no veterinário selecionado
  const availableTimeOptions = selectedDoctor
    ? generateTimeOptions(selectedDoctor.availableFromTime, selectedDoctor.availableToTime)
    : [];

  // Quando selecionar um veterinário, preencher o valor padrão e resetar horário
  useEffect(() => {
    if (selectedDoctor) {
      form.setValue("priceInCents", selectedDoctor.appointmentPriceInCents / 100);
      // Resetar horário quando mudar o veterinário
      form.setValue("appointmentTime", "");
    } else {
      form.setValue("appointmentTime", "");
    }
  }, [selectedDoctor, form]);

  // Validar data quando mudar
  useEffect(() => {
    if (selectedDoctor && appointmentDate) {
      const isValid = isDateAvailable(
        appointmentDate,
        selectedDoctor.availableFromWeekDay,
        selectedDoctor.availableToWeekDay
      );
      if (!isValid) {
        form.setError("appointmentDate", {
          type: "manual",
          message: `Este veterinário está disponível apenas de ${getWeekDayName(selectedDoctor.availableFromWeekDay)} a ${getWeekDayName(selectedDoctor.availableToWeekDay)}`,
        });
      } else {
        form.clearErrors("appointmentDate");
      }
    }
  }, [appointmentDate, selectedDoctor, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        petCodigo: "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        priceInCents: 0,
      });
      setPetValidationStatus("idle");
      setPetInfo(null);
      setIsValidatingPet(false);
    }
  }, [open, form]);

  const onSubmit = async (values: AppointmentFormData) => {
    // Validar código do pet antes de submeter
    if (petValidationStatus !== "valid") {
      const isValid = await validatePetCode(values.petCodigo);
      if (!isValid) {
        return;
      }
    }

    createAppointmentMutation.mutate(
      {
        petCodigo: values.petCodigo,
        doctorId: values.doctorId,
        appointmentDate: values.appointmentDate,
        appointmentTime: values.appointmentTime,
        priceInCents: Math.round(values.priceInCents * 100), // Converter para centavos
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const isLoading = createAppointmentMutation.isPending || isLoadingDoctors;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo agendamento
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FormField
                  control={form.control}
                  name="petCodigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código da Carteirinha do Pet</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Digite o código da carteirinha"
                            disabled={isLoading || isValidatingPet}
                            onBlur={(e) => {
                              field.onBlur();
                              validatePetCode(e.target.value);
                            }}
                            onChange={(e) => {
                              field.onChange(e);
                              setPetValidationStatus("idle");
                              setPetInfo(null);
                              form.clearErrors("petCodigo");
                            }}
                          />
                          {isValidatingPet && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                          )}
                          {!isValidatingPet && petValidationStatus === "valid" && (
                            <CheckCircle2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-600" />
                          )}
                          {!isValidatingPet && petValidationStatus === "invalid" && (
                            <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                          )}
                        </div>
                      </FormControl>
                      {petInfo && petValidationStatus === "valid" && (
                        <FieldDescription className="text-green-600">
                          Pet encontrado: {petInfo.name}
                        </FieldDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veterinário</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading || isLoadingDoctors}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">Selecione um veterinário</option>
                          {doctors.map((doctor) => (
                            <option key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </option>
                          ))}
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
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          disabled={isLoading || !selectedDoctor}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) => {
                            field.onChange(e);
                            if (selectedDoctor) {
                              const isValid = isDateAvailable(
                                e.target.value,
                                selectedDoctor.availableFromWeekDay,
                                selectedDoctor.availableToWeekDay
                              );
                              if (!isValid && e.target.value) {
                                form.setError("appointmentDate", {
                                  type: "manual",
                                  message: `Este veterinário está disponível apenas de ${getWeekDayName(selectedDoctor.availableFromWeekDay)} a ${getWeekDayName(selectedDoctor.availableToWeekDay)}`,
                                });
                              } else {
                                form.clearErrors("appointmentDate");
                              }
                            }
                          }}
                        />
                      </FormControl>
                      {selectedDoctor && (
                        <FieldDescription>
                          Disponível: {getWeekDayName(selectedDoctor.availableFromWeekDay)} a {getWeekDayName(selectedDoctor.availableToWeekDay)}
                        </FieldDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horário</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isLoading || !selectedDoctor}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          <option value="">
                            {selectedDoctor ? "Selecione um horário" : "Selecione um veterinário primeiro"}
                          </option>
                          {availableTimeOptions.map((time) => {
                            const timeDisplay = time.substring(0, 5); // Remove os segundos (HH:MM)
                            return (
                              <option key={time} value={time}>
                                {timeDisplay}
                              </option>
                            );
                          })}
                        </select>
                      </FormControl>
                      {selectedDoctor && (
                        <FieldDescription>
                          Horário: {selectedDoctor.availableFromTime.substring(0, 5)} às {selectedDoctor.availableToTime.substring(0, 5)}
                        </FieldDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>

              <Field>
                <FormField
                  control={form.control}
                  name="priceInCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Consulta</FormLabel>
                      <FormControl>
                        <NumericFormat
                          customInput={Input}
                          value={field.value ?? 0}
                          onValueChange={(values) => {
                            field.onChange(values.floatValue ?? 0);
                          }}
                          thousandSeparator="."
                          decimalSeparator=","
                          decimalScale={2}
                          allowNegative={false}
                          fixedDecimalScale={true}
                          prefix="R$ "
                          placeholder="R$ 0,00"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Criando...
                  </>
                ) : (
                  "Criar Agendamento"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
