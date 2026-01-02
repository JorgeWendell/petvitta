import { z } from "zod";

export const listSubscriptionsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["ATIVA", "CANCELADA", "SUSPENSA", "EXPIRADA"]).optional(),
  petId: z.string().optional(),
  planId: z.string().optional(),
});

