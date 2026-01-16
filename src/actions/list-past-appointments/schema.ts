import { z } from "zod";

export const listPastAppointmentsSchema = z.object({
  clinicId: z.string().min(1, "ID da clínica é obrigatório"),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

