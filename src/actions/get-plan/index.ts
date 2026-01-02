"use server";

import { db } from "@/db";
import { plansTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { getPlanSchema } from "./schema";

export const getPlanAction = actionClient
  .schema(getPlanSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const plan = await db
      .select({
        id: plansTable.id,
        name: plansTable.name,
        description: plansTable.description,
        price: plansTable.price,
        carePeriodDays: plansTable.carePeriodDays,
        status: plansTable.status,
        createdAt: plansTable.createdAt,
        updatedAt: plansTable.updatedAt,
      })
      .from(plansTable)
      .where(eq(plansTable.id, id))
      .limit(1);

    if (plan.length === 0) {
      return {
        error: "Plano não encontrado",
      };
    }

    return {
      success: true,
      plan: plan[0],
    };
  });

