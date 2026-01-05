import { z } from "zod";

export const listPetVaccinesSchema = z.object({
  petId: z.string().min(1, "Pet é obrigatório"),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

