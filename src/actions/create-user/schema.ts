import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  email: z
    .string()
    .email({ message: "E-mail inválido" })
    .min(1, { message: "E-mail é obrigatório" })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Senha deve ter pelo menos 8 caracteres" })
    .trim(),
  role: z.enum(["ADMIN", "CLINIC", "TUTOR"]),
  isActive: z.boolean().default(true),
});

