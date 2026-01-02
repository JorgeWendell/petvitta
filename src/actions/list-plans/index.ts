"use server";

import { db } from "@/db";
import { plansTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, ilike } from "drizzle-orm";

import { listPlansSchema } from "./schema";

export const listPlansAction = actionClient
  .schema(listPlansSchema)
  .action(async ({ parsedInput }) => {
    const { page, limit, search, status } = parsedInput;

    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(ilike(plansTable.name, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(plansTable.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [plans, totalCount] = await Promise.all([
      db
        .select({
          id: plansTable.id,
          name: plansTable.name,
          description: plansTable.description,
          price: plansTable.price,
          carePeriodDays: plansTable.carePeriodDays,
          status: plansTable.status,
          createdAt: plansTable.createdAt,
        })
        .from(plansTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(plansTable.createdAt)),
      db
        .select({ count: count() })
        .from(plansTable)
        .where(whereClause),
    ]);

    return {
      plans,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count ?? 0,
        totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      },
    };
  });

