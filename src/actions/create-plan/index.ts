"use server";

import { db } from "@/db";
import { plansTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { createPlanSchema } from "./schema";

export const createPlanAction = actionClient
  .schema(createPlanSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { name, description, price, carePeriodDays, status } = parsedInput;

      const planId = randomUUID();

      await db.insert(plansTable).values({
        id: planId,
        name,
        description: description || null,
        price: price,
        carePeriodDays,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdPlan = await db
        .select()
        .from(plansTable)
        .where(eq(plansTable.id, planId))
        .limit(1);

      return {
        success: true,
        plan: createdPlan[0],
      };
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar plano";
      
      if (errorMessage.includes("does not exist") || errorMessage.includes("não existe")) {
        return {
          error: "Tabela de planos não encontrada. Execute a migração do banco de dados: npx drizzle-kit push",
        };
      }
      
      return {
        error: errorMessage,
      };
    }
  });

