import { z } from "zod";

export const getMedicalRecordSchema = z.object({
  medicalRecordId: z.string().min(1, "ID do prontuário é obrigatório"),
});

