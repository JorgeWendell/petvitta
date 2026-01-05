import { z } from "zod";

export const createAppointmentSchema = z.object({
  petCodigo: z.string().min(1, { message: "Código do pet é obrigatório" }).trim(),
  doctorId: z.string().min(1, { message: "Veterinário é obrigatório" }),
  appointmentDate: z.string().min(1, { message: "Data é obrigatória" }),
  appointmentTime: z.string().min(1, { message: "Horário é obrigatório" }),
  priceInCents: z.number().min(0, { message: "Valor deve ser positivo" }),
});

