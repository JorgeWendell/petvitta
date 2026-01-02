import { z } from "zod";

export const getSubscriptionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

