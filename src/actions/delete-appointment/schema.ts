import { z } from "zod";

export const deleteAppointmentSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  clinicId: z.string().min(1, { message: "Clínica é obrigatória" }),
});

