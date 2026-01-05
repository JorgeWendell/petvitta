"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { petVaccinesTable, petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

import { createPetVaccineSchema } from "./schema";

export const createPetVaccineAction = actionClient
  .schema(createPetVaccineSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return {
          error: "Usuário não autenticado",
        };
      }

      const { petId, vaccineName, dose, vaccineDate, nextDoseDate } =
        parsedInput;

      // Verificar se o pet existe
      const pet = await db
        .select()
        .from(petsTable)
        .where(eq(petsTable.id, petId))
        .limit(1);

      if (pet.length === 0) {
        return {
          error: "Pet não encontrado",
        };
      }

      // Criar a vacina
      const vaccineId = randomUUID();

      await db.insert(petVaccinesTable).values({
        id: vaccineId,
        petId,
        vaccineName,
        dose,
        vaccineDate,
        nextDoseDate: nextDoseDate || null,
      });

      return {
        success: true,
        vaccineId,
      };
    } catch (error) {
      console.error("Erro ao criar vacina:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao criar vacina: ${errorMessage}`,
      };
    }
  });

