"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
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
import { Field, FieldContent, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useUpsertDoctor } from "@/hooks/mutations/use-upsert-doctor";

const doctorFormSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Nome é obrigatório" })
      .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
      .max(100, { message: "Nome deve ter no máximo 100 caracteres" })
      .trim(),
    email: z
      .string()
      .email({ message: "E-mail inválido" })
      .min(1, { message: "E-mail é obrigatório" })
      .max(255, { message: "E-mail deve ter no máximo 255 caracteres" })
      .trim()
      .toLowerCase(),
    availableFromWeekDay: z
      .string()
      .min(1, { message: "Dia inicial é obrigatório" }),
    availableToWeekDay: z
      .string()
      .min(1, { message: "Dia final é obrigatório" }),
    availableFromTime: z
      .string()
      .min(1, { message: "Hora inicial é obrigatória" }),
    availableToTime: z
      .string()
      .min(1, { message: "Hora final é obrigatória" }),
    appointmentPriceInCents: z
      .number()
      .min(0, { message: "Preço da consulta é obrigatório" }),
  })
  .refine(
    (data) => {
      const fromDay = parseInt(data.availableFromWeekDay);
      const toDay = parseInt(data.availableToWeekDay);
      return fromDay <= toDay;
    },
    {
      path: ["availableToWeekDay"],
      message: "Dia final deve ser maior ou igual ao dia inicial",
    }
  )
  .refine(
    (data) => {
      return data.availableFromTime < data.availableToTime;
    },
    {
      path: ["availableToTime"],
      message: "Hora inicial deve ser menor que a hora final",
    }
  );

type DoctorFormData = z.infer<typeof doctorFormSchema>;

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
};

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor?: Doctor | null;
  clinicId: string;
  onSuccess?: () => void;
}

const weekDays = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda-feira" },
  { value: "2", label: "Terça-feira" },
  { value: "3", label: "Quarta-feira" },
  { value: "4", label: "Quinta-feira" },
  { value: "5", label: "Sexta-feira" },
  { value: "6", label: "Sábado" },
];

const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 5; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}:00`;
      times.push(timeString);
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

export function DoctorFormDialog({
  open,
  onOpenChange,
  doctor,
  clinicId,
  onSuccess,
}: DoctorFormDialogProps) {
  const isEditing = !!doctor;

  const upsertDoctorMutation = useUpsertDoctor();

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      availableFromWeekDay: "1",
      availableToWeekDay: "5",
      availableFromTime: "08:00:00",
      availableToTime: "18:00:00",
      appointmentPriceInCents: 0,
    },
  });

  useEffect(() => {
    if (doctor && open) {
      form.reset({
        name: doctor.name,
        email: doctor.email,
        availableFromWeekDay: doctor.availableFromWeekDay.toString(),
        availableToWeekDay: doctor.availableToWeekDay.toString(),
        availableFromTime: doctor.availableFromTime,
        availableToTime: doctor.availableToTime,
        appointmentPriceInCents: doctor.appointmentPriceInCents / 100,
      });
    } else if (open) {
      form.reset({
        name: "",
        email: "",
        availableFromWeekDay: "1",
        availableToWeekDay: "5",
        availableFromTime: "08:00:00",
        availableToTime: "18:00:00",
        appointmentPriceInCents: 0,
      });
    }
  }, [doctor, open, form]);

  const onSubmit = async (values: DoctorFormData) => {
    upsertDoctorMutation.mutate(
      {
        id: doctor?.id,
        clinicId,
        name: values.name,
        email: values.email,
        availableFromWeekDay: parseInt(values.availableFromWeekDay),
        availableToWeekDay: parseInt(values.availableToWeekDay),
        availableFromTime: values.availableFromTime,
        availableToTime: values.availableToTime,
        appointmentPriceInCents: Math.round(values.appointmentPriceInCents * 100),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      }
    );
  };

  const isLoading = upsertDoctorMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Veterinário" : "Novo Veterinário"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do veterinário"
              : "Preencha os dados para cadastrar um novo veterinário"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Field>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Digite o nome completo"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="veterinario@exemplo.com"
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
                  name="availableFromWeekDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia inicial de atendimento</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || "1"}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          {weekDays.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
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
                  name="availableToWeekDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia final de atendimento</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || "5"}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          {weekDays.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
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
                  name="availableFromTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora inicial de atendimento</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || "08:00:00"}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          {timeOptions.map((time) => {
                            const [hours, minutes] = time.split(":");
                            const displayTime = `${hours}:${minutes}`;
                            return (
                              <option key={time} value={time}>
                                {displayTime}
                              </option>
                            );
                          })}
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
                  name="availableToTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora final de atendimento</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value || "18:00:00"}
                          disabled={isLoading}
                          className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
                        >
                          {timeOptions.map((time) => {
                            const [hours, minutes] = time.split(":");
                            const displayTime = `${hours}:${minutes}`;
                            return (
                              <option key={time} value={time}>
                                {displayTime}
                              </option>
                            );
                          })}
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
                  name="appointmentPriceInCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço da consulta</FormLabel>
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
                    {isEditing ? "Atualizando..." : "Criando..."}
                  </>
                ) : isEditing ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

