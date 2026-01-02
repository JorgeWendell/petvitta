"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, not } from "drizzle-orm";

import { updateUserSchema } from "./schema";

export const updateUserAction = actionClient
  .schema(updateUserSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, email, role, isActive } = parsedInput;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    if (existingUser.length === 0) {
      return {
        error: "Usuário não encontrado",
      };
    }

    const emailConflict = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email), not(eq(usersTable.id, id))))
      .limit(1);

    if (emailConflict.length > 0) {
      return {
        error: "E-mail já está em uso",
      };
    }

    await db
      .update(usersTable)
      .set({
        name,
        email,
        role,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id));

    const updatedUser = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        isActive: usersTable.isActive,
      })
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);

    return {
      success: true,
      user: updatedUser[0],
    };
  });

