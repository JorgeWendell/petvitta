"use server";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, ilike } from "drizzle-orm";

import { listClinicsSchema } from "./schema";

export const listClinicsAction = actionClient
  .schema(listClinicsSchema)
  .action(async ({ parsedInput }) => {
    const { page, limit, search, status } = parsedInput;

    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(ilike(clinicsTable.name, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(clinicsTable.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [clinics, totalCount] = await Promise.all([
      db
        .select({
          id: clinicsTable.id,
          name: clinicsTable.name,
          cnpj: clinicsTable.cnpj,
          phone: clinicsTable.phone,
          email: clinicsTable.email,
          address: clinicsTable.address,
          city: clinicsTable.city,
          state: clinicsTable.state,
          zipCode: clinicsTable.zipCode,
          userId: clinicsTable.userId,
          status: clinicsTable.status,
          createdAt: clinicsTable.createdAt,
        })
        .from(clinicsTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(clinicsTable.createdAt)),
      db
        .select({ count: count() })
        .from(clinicsTable)
        .where(whereClause),
    ]);

    return {
      clinics,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count ?? 0,
        totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      },
    };
  });

