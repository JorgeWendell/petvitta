"use server";

import { db } from "@/db";
import { petsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { updatePetSchema } from "./schema";

export const updatePetAction = actionClient
  .schema(updatePetSchema)
  .action(async ({ parsedInput }) => {
    const { id, codigo, name, species, breed, dateOfBirth, gender, status, tutorId, planId } = parsedInput;

    const existingPet = await db
      .select()
      .from(petsTable)
      .where(eq(petsTable.id, id))
      .limit(1);

    if (existingPet.length === 0) {
      return {
        error: "Pet não encontrado",
      };
    }

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

    const dateOfBirthValue = dateOfBirth ? new Date(dateOfBirth) : null;

    await db
      .update(petsTable)
      .set({
        codigo: codigo || null,
        name,
        species,
        breed: breed || null,
        dateOfBirth: dateOfBirthValue,
        gender: gender || null,
        status,
        tutorId,
        planId: planId || null,
        updatedAt: new Date(),
      })
      .where(eq(petsTable.id, id));

      const updatedPetRaw = await db
        .select({
          id: petsTable.id,
          codigo: petsTable.codigo,
          name: petsTable.name,
          species: petsTable.species,
          breed: petsTable.breed,
          dateOfBirth: petsTable.dateOfBirth,
          gender: petsTable.gender,
          status: petsTable.status,
          tutorId: petsTable.tutorId,
          planId: petsTable.planId,
          createdAt: petsTable.createdAt,
          updatedAt: petsTable.updatedAt,
        })
        .from(petsTable)
        .where(eq(petsTable.id, id))
        .limit(1);

    if (updatedPetRaw.length === 0) {
      return {
        error: "Erro ao recuperar pet atualizado",
      };
    }

    // Converter codigo para string se necessário
    let codigoValue: string | null = null;
    const codigoField = updatedPetRaw[0].codigo;
    if (codigoField != null && codigoField !== undefined) {
      // O campo numeric pode vir como objeto ou string
      if (typeof codigoField === 'object' && codigoField !== null) {
        // Se for um objeto (como Decimal do Drizzle), pegar o valor
        codigoValue = (codigoField as any).toString ? (codigoField as any).toString() : String(codigoField);
      } else {
        codigoValue = String(codigoField);
      }
    }
    const updatedPet = {
      ...updatedPetRaw[0],
      codigo: codigoValue,
    };

    return {
      success: true,
      pet: updatedPet,
    };
  });

