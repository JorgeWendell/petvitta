import { z } from "zod";

export const getPlanSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
});

