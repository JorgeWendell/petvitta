"use server";

import { db } from "@/db";
import { petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import { listPetsSchema } from "./schema";

export const listPetsAction = actionClient
  .schema(listPetsSchema)
  .action(async ({ parsedInput }) => {
    const { page, limit, search, status, tutorId } = parsedInput;

    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(ilike(petsTable.name, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(petsTable.status, status));
    }

    if (tutorId) {
      conditions.push(eq(petsTable.tutorId, tutorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [pets, totalCount] = await Promise.all([
      db
        .select({
          id: petsTable.id,
          name: petsTable.name,
          species: petsTable.species,
          breed: petsTable.breed,
          dateOfBirth: petsTable.dateOfBirth,
          gender: petsTable.gender,
          status: petsTable.status,
          tutorId: petsTable.tutorId,
          planId: petsTable.planId,
          qrCode: petsTable.qrCode,
          createdAt: petsTable.createdAt,
        })
        .from(petsTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(petsTable.createdAt)),
      db
        .select({ count: count() })
        .from(petsTable)
        .where(whereClause),
    ]);

    return {
      pets,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count ?? 0,
        totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      },
    };
  });

