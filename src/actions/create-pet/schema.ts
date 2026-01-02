import { z } from "zod";

export const createPetSchema = z.object({
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  species: z.enum(["CÃO", "GATO", "PASSARO", "COELHO", "HAMSTER", "OUTRO"], {
    required_error: "Espécie é obrigatória",
  }),
  breed: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MACHO", "FÊMEA"]).optional(),
  status: z.enum(["ATIVO", "SUSPENSO"]).default("ATIVO"),
  tutorId: z.string().min(1, { message: "Tutor é obrigatório" }),
  planId: z.string().optional(),
});

