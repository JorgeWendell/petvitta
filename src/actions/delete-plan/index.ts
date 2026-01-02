"use server";

import { db } from "@/db";
import { plansTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { deletePlanSchema } from "./schema";

export const deletePlanAction = actionClient
  .schema(deletePlanSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const existingPlan = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.id, id))
      .limit(1);

    if (existingPlan.length === 0) {
      return {
        error: "Plano não encontrado",
      };
    }

    await db.delete(plansTable).where(eq(plansTable.id, id));

    return {
      success: true,
    };
  });

