import { z } from "zod";

export const updateUserSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  email: z
    .string()
    .email({ message: "E-mail inválido" })
    .min(1, { message: "E-mail é obrigatório" })
    .trim(),
  role: z.enum(["ADMIN", "CLINIC", "TUTOR"], {
    required_error: "Papel é obrigatório",
  }),
  isActive: z.boolean(),
});

