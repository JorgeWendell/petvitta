import { z } from "zod";

export const updatePlanSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  description: z.string().optional(),
  price: z
    .string()
    .min(1, { message: "Preço é obrigatório" })
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      { message: "Preço deve ser um número válido" }
    ),
  carePeriodDays: z.number().min(0, { message: "Carência deve ser um número positivo" }),
  status: z.enum(["ATIVO", "INATIVO"]),
});

