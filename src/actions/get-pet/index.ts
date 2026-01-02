"use server";

import { db } from "@/db";
import { petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { getPetSchema } from "./schema";

export const getPetAction = actionClient
  .schema(getPetSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const pet = await db
      .select({
        id: petsTable.id,
        name: petsTable.name,
        species: petsTable.species,
        breed: petsTable.breed,
        dateOfBirth: petsTable.dateOfBirth,
        gender: petsTable.gender,
        status: petsTable.status,
        tutorId: petsTable.tutorId,
        planId: petsTable.planId,
        qrCode: petsTable.qrCode,
        createdAt: petsTable.createdAt,
        updatedAt: petsTable.updatedAt,
      })
      .from(petsTable)
      .where(eq(petsTable.id, id))
      .limit(1);

    if (pet.length === 0) {
      return {
        error: "Pet não encontrado",
      };
    }

    return {
      success: true,
      pet: pet[0],
    };
  });

