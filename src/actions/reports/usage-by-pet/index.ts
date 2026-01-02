"use server";

import { db } from "@/db";
import { petsTable, subscriptionsTable, plansTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, sql } from "drizzle-orm";

import { usageByPetReportSchema } from "./schema";

export const usageByPetReportAction = actionClient
  .schema(usageByPetReportSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { month, year } = parsedInput;

      let whereClause = eq(subscriptionsTable.status, "ATIVA");

      if (month && year) {
        whereClause = and(
          eq(subscriptionsTable.status, "ATIVA"),
          sql`EXTRACT(MONTH FROM ${subscriptionsTable.startDate}) = ${month}`,
          sql`EXTRACT(YEAR FROM ${subscriptionsTable.startDate}) = ${year}`
        ) as any;
      } else if (year) {
        whereClause = and(
          eq(subscriptionsTable.status, "ATIVA"),
          sql`EXTRACT(YEAR FROM ${subscriptionsTable.startDate}) = ${year}`
        ) as any;
      }

      const subscriptions = await db
        .select({
          petId: petsTable.id,
          petName: petsTable.name,
          tutorName: usersTable.name,
          tutorEmail: usersTable.email,
          planName: plansTable.name,
          planPrice: plansTable.price,
          subscriptionStartDate: subscriptionsTable.startDate,
          subscriptionStatus: subscriptionsTable.status,
          subscriptionId: subscriptionsTable.id,
        })
        .from(subscriptionsTable)
        .innerJoin(petsTable, eq(subscriptionsTable.petId, petsTable.id))
        .innerJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
        .innerJoin(usersTable, eq(petsTable.tutorId, usersTable.id))
        .where(whereClause)
        .orderBy(petsTable.name);

      return {
        data: subscriptions,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de uso por pet:", error);
      return {
        error: "Erro interno do servidor ao gerar relatório. Verifique os logs para mais detalhes.",
      };
    }
  });

