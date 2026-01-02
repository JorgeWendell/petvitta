import { z } from "zod";

export const updatePetSchema = z.object({
  id: z.string().min(1, { message: "ID é obrigatório" }),
  name: z.string().min(1, { message: "Nome é obrigatório" }).trim(),
  species: z.enum(["CÃO", "GATO", "PASSARO", "COELHO", "HAMSTER", "OUTRO"], {
    required_error: "Espécie é obrigatória",
  }),
  breed: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MACHO", "FÊMEA"]).optional(),
  status: z.enum(["ATIVO", "SUSPENSO"]),
  tutorId: z.string().min(1, { message: "Tutor é obrigatório" }),
  planId: z.string().optional(),
});

