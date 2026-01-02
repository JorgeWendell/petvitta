"use server";

import { db } from "@/db";
import { plansTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { updatePlanSchema } from "./schema";

export const updatePlanAction = actionClient
  .schema(updatePlanSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, description, price, carePeriodDays, status } = parsedInput;

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

    await db
      .update(plansTable)
      .set({
        name,
        description: description || null,
        price,
        carePeriodDays,
        status,
        updatedAt: new Date(),
      })
      .where(eq(plansTable.id, id));

    const updatedPlan = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.id, id))
      .limit(1);

    return {
      success: true,
      plan: updatedPlan[0],
    };
  });

