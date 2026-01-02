import { z } from "zod";

export const deleteSubscriptionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

