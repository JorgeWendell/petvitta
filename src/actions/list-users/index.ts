"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, ilike } from "drizzle-orm";

import { listUsersSchema } from "./schema";

export const listUsersAction = actionClient
  .schema(listUsersSchema)
  .action(async ({ parsedInput }) => {
    const { page, limit, search, role } = parsedInput;

    const offset = (page - 1) * limit;

    const conditions = [];

    if (search) {
      conditions.push(ilike(usersTable.name, `%${search}%`));
    }

    if (role) {
      conditions.push(eq(usersTable.role, role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [users, totalCount] = await Promise.all([
      db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
          role: usersTable.role,
          isActive: usersTable.isActive,
          emailVerified: usersTable.emailVerified,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(usersTable.createdAt)),
      db
        .select({ count: count() })
        .from(usersTable)
        .where(whereClause),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count ?? 0,
        totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
      },
    };
  });

