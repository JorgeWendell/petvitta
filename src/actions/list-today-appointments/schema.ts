import { z } from "zod";

export const listTodayAppointmentsSchema = z.object({
  clinicId: z.string().min(1, { message: "Clínica é obrigatória" }),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

