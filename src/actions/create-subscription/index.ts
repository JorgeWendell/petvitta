"use server";

import { db } from "@/db";
import { petsTable, plansTable, subscriptionsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { createSubscriptionSchema } from "./schema";

export const createSubscriptionAction = actionClient
  .schema(createSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const {
        petId,
        planId,
        status,
        startDate,
        endDate,
        nextBillingDate,
        asaasSubscriptionId,
      } = parsedInput;

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

      // Verificar se já existe uma assinatura ativa para este pet
      const existingSubscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.petId, petId))
        .limit(1);

      // Permitir múltiplas assinaturas, mas podemos adicionar validação se necessário

      const subscriptionId = randomUUID();

      const startDateValue = startDate ? new Date(startDate) : new Date();
      const endDateValue = endDate ? new Date(endDate) : null;
      const nextBillingDateValue = nextBillingDate ? new Date(nextBillingDate) : null;

      await db.insert(subscriptionsTable).values({
        id: subscriptionId,
        petId,
        planId,
        status,
        startDate: startDateValue,
        endDate: endDateValue,
        nextBillingDate: nextBillingDateValue,
        asaasSubscriptionId: asaasSubscriptionId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdSubscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, subscriptionId))
        .limit(1);

      return {
        success: true,
        subscription: createdSubscription[0],
      };
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar assinatura";

      if (
        errorMessage.includes("does not exist") ||
        errorMessage.includes("não existe")
      ) {
        return {
          error:
            "Tabela de assinaturas não encontrada. Execute a migração do banco de dados: npx drizzle-kit push",
        };
      }

      return {
        error: errorMessage,
      };
    }
  });

