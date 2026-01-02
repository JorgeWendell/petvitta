"use server";

import { db } from "@/db";
import { petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { deletePetSchema } from "./schema";

export const deletePetAction = actionClient
  .schema(deletePetSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

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

    await db.delete(petsTable).where(eq(petsTable.id, id));

    return {
      success: true,
    };
  });

