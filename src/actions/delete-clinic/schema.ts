import { z } from "zod";

export const deleteClinicSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
});

