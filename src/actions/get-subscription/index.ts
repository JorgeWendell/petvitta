"use server";

import { db } from "@/db";
import { subscriptionsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { getSubscriptionSchema } from "./schema";

export const getSubscriptionAction = actionClient
  .schema(getSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id } = parsedInput;

      const subscription = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.id, id))
        .limit(1);

      if (subscription.length === 0) {
        return {
          error: "Assinatura não encontrada",
        };
      }

      return {
        subscription: subscription[0],
      };
    } catch (error) {
      console.error("Erro ao buscar assinatura:", error);
      return {
        error: "Erro interno do servidor ao buscar assinatura. Verifique os logs para mais detalhes.",
      };
    }
  });

