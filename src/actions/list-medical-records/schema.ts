import { z } from "zod";

export const listMedicalRecordsSchema = z.object({
  petId: z.string().min(1, "Pet é obrigatório"),
});

