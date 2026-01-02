import { z } from "zod";

export const deletePlanSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
});

