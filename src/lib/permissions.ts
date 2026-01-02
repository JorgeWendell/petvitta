import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export type UserRole = "ADMIN" | "CLINIC" | "TUTOR";

export interface UserPermissions {
  role: UserRole;
  isActive: boolean;
}

export async function getUserPermissions(
  userId: string
): Promise<UserPermissions | null> {
  const user = await db
    .select({
      role: usersTable.role,
      isActive: usersTable.isActive,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user[0]) {
    return null;
  }

  return {
    role: user[0].role as UserRole,
    isActive: user[0].isActive,
  };
}

