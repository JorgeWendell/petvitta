"use server";

import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { getClinicSchema } from "./schema";

export const getClinicAction = actionClient
  .schema(getClinicSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const clinic = await db
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
        updatedAt: clinicsTable.updatedAt,
      })
      .from(clinicsTable)
      .where(eq(clinicsTable.id, id))
      .limit(1);

    if (clinic.length === 0) {
      return {
        error: "Clínica não encontrada",
      };
    }

    return {
      success: true,
      clinic: clinic[0],
    };
  });

