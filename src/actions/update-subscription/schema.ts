import { z } from "zod";

export const updateSubscriptionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  petId: z.string().min(1, "Pet é obrigatório"),
  planId: z.string().min(1, "Plano é obrigatório"),
  status: z.enum(["ATIVA", "CANCELADA", "SUSPENSA", "EXPIRADA"]),
  startDate: z.string().min(1, "Data de início é obrigatória"),
  endDate: z.string().optional(),
  nextBillingDate: z.string().optional(),
  asaasSubscriptionId: z.string().optional(),
});

