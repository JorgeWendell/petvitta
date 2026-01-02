"use server";

import { db } from "@/db";
import { clinicsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, not } from "drizzle-orm";

import { updateClinicSchema } from "./schema";

export const updateClinicAction = actionClient
  .schema(updateClinicSchema)
  .action(async ({ parsedInput }) => {
    const { id, name, cnpj, phone, email, address, city, state, zipCode, userId, status } = parsedInput;

    const existingClinic = await db
      .select()
      .from(clinicsTable)
      .where(eq(clinicsTable.id, id))
      .limit(1);

    if (existingClinic.length === 0) {
      return {
        error: "Clínica não encontrada",
      };
    }

    // Verificar se o usuário existe e tem role CLINIC
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      return {
        error: "Usuário não encontrado",
      };
    }

    if (user[0].role !== "CLINIC") {
      return {
        error: "O usuário deve ter o papel de CLINIC",
      };
    }

    // Verificar se CNPJ já existe em outra clínica (se fornecido)
    if (cnpj) {
      const cnpjConflict = await db
        .select()
        .from(clinicsTable)
        .where(and(eq(clinicsTable.cnpj, cnpj), not(eq(clinicsTable.id, id))))
        .limit(1);

      if (cnpjConflict.length > 0) {
        return {
          error: "CNPJ já está em uso",
        };
      }
    }

    await db
      .update(clinicsTable)
      .set({
        name,
        cnpj: cnpj || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        userId,
        status,
        updatedAt: new Date(),
      })
      .where(eq(clinicsTable.id, id));

    const updatedClinic = await db
      .select()
      .from(clinicsTable)
      .where(eq(clinicsTable.id, id))
      .limit(1);

    return {
      success: true,
      clinic: updatedClinic[0],
    };
  });

