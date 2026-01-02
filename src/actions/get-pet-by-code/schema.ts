import { z } from "zod";

export const getPetByCodeSchema = z.object({
  codigo: z.string().min(1, { message: "Código é obrigatório" }),
});

