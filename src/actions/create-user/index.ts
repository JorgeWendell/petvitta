"use server";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { createUserSchema } from "./schema";

export const createUserAction = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password, role, isActive } = parsedInput;

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        error: "E-mail já está em uso",
      };
    }

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result?.user) {
      const createdUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (createdUser.length > 0) {
        await db
          .update(usersTable)
          .set({
            role,
            isActive,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, createdUser[0].id));

        return {
          success: true,
          user: {
            id: createdUser[0].id,
            name: createdUser[0].name,
            email: createdUser[0].email,
            role,
            isActive,
          },
        };
      }

      return {
        error: "Erro ao criar usuário",
      };
    }

    await db
      .update(usersTable)
      .set({
        role,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, result.user.id));

    return {
      success: true,
      user: {
        id: result.user.id,
        name: result.user.name || name,
        email: result.user.email || email,
        role,
        isActive,
      },
    };
  });

