"use server";

import { db } from "@/db";
import { subscriptionsTable, petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, ilike } from "drizzle-orm";

import { listSubscriptionsSchema } from "./schema";

export const listSubscriptionsAction = actionClient
  .schema(listSubscriptionsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { page, limit, search, status, petId, planId } = parsedInput;

      const offset = (page - 1) * limit;

      const conditions = [];

      if (search) {
        conditions.push(ilike(petsTable.name, `%${search}%`));
      }

      if (status) {
        conditions.push(eq(subscriptionsTable.status, status));
      }

      if (petId) {
        conditions.push(eq(subscriptionsTable.petId, petId));
      }

      if (planId) {
        conditions.push(eq(subscriptionsTable.planId, planId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [subscriptions, totalCount] = await Promise.all([
        db
          .select({
            id: subscriptionsTable.id,
            petId: subscriptionsTable.petId,
            planId: subscriptionsTable.planId,
            status: subscriptionsTable.status,
            startDate: subscriptionsTable.startDate,
            endDate: subscriptionsTable.endDate,
            nextBillingDate: subscriptionsTable.nextBillingDate,
            asaasSubscriptionId: subscriptionsTable.asaasSubscriptionId,
            createdAt: subscriptionsTable.createdAt,
            updatedAt: subscriptionsTable.updatedAt,
          })
          .from(subscriptionsTable)
          .innerJoin(petsTable, eq(subscriptionsTable.petId, petsTable.id))
          .where(whereClause)
          .orderBy(desc(subscriptionsTable.createdAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ count: count() })
          .from(subscriptionsTable)
          .innerJoin(petsTable, eq(subscriptionsTable.petId, petsTable.id))
          .where(whereClause),
      ]);

      return {
        subscriptions,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count ?? 0,
          totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar assinaturas:", error);
      return {
        subscriptions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      };
    }
  });

