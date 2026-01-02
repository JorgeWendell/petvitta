"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { getUserSchema } from "./schema";

export const getUserAction = actionClient
  .schema(getUserSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const user = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        isActive: usersTable.isActive,
        emailVerified: usersTable.emailVerified,
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (user.length === 0) {
      return {
        error: "Usuário não encontrado",
      };
    }

    return {
      success: true,
      user: user[0],
    };
  });

