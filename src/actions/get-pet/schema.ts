import { z } from "zod";

export const getPetSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
});

