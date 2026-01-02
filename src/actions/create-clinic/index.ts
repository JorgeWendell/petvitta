"use server";

import { db } from "@/db";
import { clinicsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { createClinicSchema } from "./schema";

export const createClinicAction = actionClient
  .schema(createClinicSchema)
  .action(async ({ parsedInput }) => {
    try {
      const {
        name,
        cnpj,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        userId,
        status,
      } = parsedInput;

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

      // Verificar se já existe uma clínica para este usuário
      const existingClinic = await db
        .select()
        .from(clinicsTable)
        .where(eq(clinicsTable.userId, userId))
        .limit(1);

      if (existingClinic.length > 0) {
        return {
          error: "Já existe uma clínica cadastrada para este usuário",
        };
      }

      // Verificar se CNPJ já existe (se fornecido)
      if (cnpj) {
        const cnpjExists = await db
          .select()
          .from(clinicsTable)
          .where(eq(clinicsTable.cnpj, cnpj))
          .limit(1);

        if (cnpjExists.length > 0) {
          return {
            error: "CNPJ já está em uso",
          };
        }
      }

      const clinicId = randomUUID();

      await db.insert(clinicsTable).values({
        id: clinicId,
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdClinic = await db
        .select()
        .from(clinicsTable)
        .where(eq(clinicsTable.id, clinicId))
        .limit(1);

      return {
        success: true,
        clinic: createdClinic[0],
      };
    } catch (error) {
      console.error("Erro ao criar clínica:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao criar clínica";

      if (
        errorMessage.includes("does not exist") ||
        errorMessage.includes("não existe")
      ) {
        return {
          error:
            "Tabela de clínicas não encontrada. Execute a migração do banco de dados: npx drizzle-kit push",
        };
      }

      return {
        error: errorMessage,
      };
    }
  });
