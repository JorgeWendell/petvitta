import { z } from "zod";

export const createClinicSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido" }).optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  userId: z.string().min(1, { message: "Usuário é obrigatório" }),
  status: z.enum(["ATIVO", "INATIVO"]).default("ATIVO"),
});

