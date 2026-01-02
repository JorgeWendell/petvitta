import { z } from "zod";

export const upsertDoctorSchema = z.object({
  id: z.string().optional(),
  clinicId: z.string().min(1, { message: "Clínica é obrigatória" }),
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  email: z
    .string()
    .email({ message: "E-mail inválido" })
    .min(1, { message: "E-mail é obrigatório" })
    .trim()
    .toLowerCase(),
  availableFromWeekDay: z
    .number()
    .min(0, { message: "Dia inicial inválido" })
    .max(6, { message: "Dia inicial inválido" }),
  availableToWeekDay: z
    .number()
    .min(0, { message: "Dia final inválido" })
    .max(6, { message: "Dia final inválido" }),
  availableFromTime: z.string().min(1, { message: "Hora inicial é obrigatória" }),
  availableToTime: z.string().min(1, { message: "Hora final é obrigatória" }),
  avatarImageUrl: z.string().optional(),
  appointmentPriceInCents: z
    .number()
    .min(0, { message: "Preço da consulta é obrigatório" }),
});

