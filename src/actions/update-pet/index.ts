"use server";

import { db } from "@/db";
import { petsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { updatePetSchema } from "./schema";

export const updatePetAction = actionClient
  .schema(updatePetSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, species, breed, dateOfBirth, gender, status, tutorId, planId } = parsedInput;

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

    const updatedPet = await db
      .select()
      .from(petsTable)
      .where(eq(petsTable.id, id))
      .limit(1);

    return {
      success: true,
      pet: updatedPet[0],
    };
  });

