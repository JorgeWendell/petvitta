import { z } from "zod";

export const createPetVaccineSchema = z.object({
  petId: z.string().min(1, "Pet é obrigatório"),
  vaccineName: z.string().min(1, "Nome da vacina é obrigatório"),
  dose: z.string().min(1, "Dose é obrigatória"),
  vaccineDate: z.string().min(1, "Data é obrigatória"),
  nextDoseDate: z.string().optional(),
});

