"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { deleteUserSchema } from "./schema";

export const deleteUserAction = actionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

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

    await db.delete(usersTable).where(eq(usersTable.id, id));

    return {
      success: true,
    };
  });

