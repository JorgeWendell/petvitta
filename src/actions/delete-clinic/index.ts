"use server";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { deleteClinicSchema } from "./schema";

export const deleteClinicAction = actionClient
  .schema(deleteClinicSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const existingClinic = await db
      .select()
      .from(clinicsTable)
      .where(eq(clinicsTable.id, id))
      .limit(1);

    if (existingClinic.length === 0) {
      return {
        error: "Clínica não encontrada",
      };
    }

    await db.delete(clinicsTable).where(eq(clinicsTable.id, id));

    return {
      success: true,
    };
  });

