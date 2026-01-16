"use server";

import { db } from "@/db";
import { petsTable, plansTable, subscriptionsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { updateSubscriptionSchema } from "./schema";

export const updateSubscriptionAction = actionClient
  .schema(updateSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const {
        id,
        petId,
        planId,
        status,
        startDate,
        endDate,
        nextBillingDate,
        asaasSubscriptionId,
      } = parsedInput;

      // Verificar se a assinatura existe
      const existingSubscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .limit(1);

      if (existingSubscription.length === 0) {
        return {
          error: "Assinatura não encontrada",
        };
      }

      // Verificar se o pet existe
      const pet = await db
        .select()
        .from(petsTable)
        .where(eq(petsTable.id, petId))
        .limit(1);

      if (pet.length === 0) {
        return {
          error: "Pet não encontrado",
        };
      }

      // Verificar se o plano existe
      const plan = await db
        .select()
        .from(plansTable)
        .where(eq(plansTable.id, planId))
        .limit(1);

      if (plan.length === 0) {
        return {
          error: "Plano não encontrado",
        };
      }

      await db
        .update(subscriptionsTable)
        .set({
          petId,
          planId,
          status,
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || null,
          nextBillingDate: nextBillingDate || null,
          asaasSubscriptionId: asaasSubscriptionId || null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionsTable.id, id));

      const updatedSubscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .limit(1);

      return {
        success: true,
        subscription: updatedSubscription[0],
      };
    } catch (error) {
      console.error("Erro ao atualizar assinatura:", error);
      return {
        error: "Erro interno do servidor ao atualizar assinatura. Verifique os logs para mais detalhes.",
      };
    }
  });

