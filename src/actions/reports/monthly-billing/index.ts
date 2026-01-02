"use server";

import { db } from "@/db";
import { subscriptionsTable, plansTable, petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, sql } from "drizzle-orm";

import { monthlyBillingReportSchema } from "./schema";

export const monthlyBillingReportAction = actionClient
  .schema(monthlyBillingReportSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { month, year } = parsedInput;

      const whereClause = and(
        eq(subscriptionsTable.status, "ATIVA"),
        sql`EXTRACT(MONTH FROM ${subscriptionsTable.startDate}) = ${month}`,
        sql`EXTRACT(YEAR FROM ${subscriptionsTable.startDate}) = ${year}`
      ) as any;

      const subscriptions = await db
        .select({
          subscriptionId: subscriptionsTable.id,
          petName: petsTable.name,
          planName: plansTable.name,
          planPrice: plansTable.price,
          subscriptionStartDate: subscriptionsTable.startDate,
          subscriptionCreatedAt: subscriptionsTable.createdAt,
        })
        .from(subscriptionsTable)
        .innerJoin(petsTable, eq(subscriptionsTable.petId, petsTable.id))
        .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
        .where(whereClause)
        .orderBy(subscriptionsTable.createdAt);

      const totalRevenue = subscriptions.reduce((sum, sub) => {
        const price = parseFloat(sub.planPrice || "0");
        return sum + price;
      }, 0);

      const totalSubscriptions = subscriptions.length;

      return {
        data: {
          month,
          year,
          subscriptions,
          totalRevenue: totalRevenue.toFixed(2),
          totalSubscriptions,
        },
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de faturamento mensal:", error);
      return {
        error: "Erro interno do servidor ao gerar relatório. Verifique os logs para mais detalhes.",
      };
    }
  });

