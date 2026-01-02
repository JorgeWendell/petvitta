import { z } from "zod";

export const getUserSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
});

