import { z } from "zod";

export const deleteDoctorSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
});

