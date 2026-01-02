"use server";

import { db } from "@/db";
import { subscriptionsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { deleteSubscriptionSchema } from "./schema";

export const deleteSubscriptionAction = actionClient
  .schema(deleteSubscriptionSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { id } = parsedInput;

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

      await db.delete(subscriptionsTable).where(eq(subscriptionsTable.id, id));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao excluir assinatura:", error);
      return {
        error: "Erro interno do servidor ao excluir assinatura. Verifique os logs para mais detalhes.",
      };
    }
  });

