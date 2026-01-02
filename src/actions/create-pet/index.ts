"use server";

import { db } from "@/db";
import { petsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { createPetSchema } from "./schema";

export const createPetAction = actionClient
  .schema(createPetSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { name, species, breed, dateOfBirth, gender, status, tutorId, planId } = parsedInput;

      // Verificar se o tutor existe
      const tutor = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, tutorId))
        .limit(1);

      if (tutor.length === 0) {
        return {
          error: "Tutor não encontrado",
        };
      }

      const petId = randomUUID();
      const qrCode = `PET-${petId}`; // QR Code temporário, será gerado pela API Python no futuro

      const dateOfBirthValue = dateOfBirth ? new Date(dateOfBirth) : null;

      await db.insert(petsTable).values({
        id: petId,
        name,
        species,
        breed: breed || null,
        dateOfBirth: dateOfBirthValue,
        gender: gender || null,
        status,
        tutorId,
        planId: planId || null,
        qrCode,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdPet = await db
        .select()
        .from(petsTable)
        .where(eq(petsTable.id, petId))
        .limit(1);

      return {
        success: true,
        pet: createdPet[0],
      };
    } catch (error) {
      console.error("Erro ao criar pet:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar pet";
      
      // Verificar se é erro de tabela não encontrada
      if (errorMessage.includes("does not exist") || errorMessage.includes("não existe")) {
        return {
          error: "Tabela de pets não encontrada. Execute a migração do banco de dados: npx drizzle-kit push",
        };
      }
      
      return {
        error: errorMessage,
      };
    }
  });

