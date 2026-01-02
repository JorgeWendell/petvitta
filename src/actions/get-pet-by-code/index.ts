"use server";

import { db } from "@/db";
import { petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { getPetByCodeSchema } from "./schema";

export const getPetByCodeAction = actionClient
  .schema(getPetByCodeSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { codigo } = parsedInput;

      // Converter código para número para busca
      const codigoNumber = codigo.trim();

      const petRaw = await db
        .select({
          id: petsTable.id,
          codigo: petsTable.codigo,
          name: petsTable.name,
          species: petsTable.species,
          breed: petsTable.breed,
          dateOfBirth: petsTable.dateOfBirth,
          gender: petsTable.gender,
          status: petsTable.status,
          tutorId: petsTable.tutorId,
          planId: petsTable.planId,
          createdAt: petsTable.createdAt,
          updatedAt: petsTable.updatedAt,
        })
        .from(petsTable)
        .where(eq(petsTable.codigo, codigoNumber))
        .limit(1);

      if (petRaw.length === 0) {
        return {
          error: "Pet não encontrado",
        };
      }

      // Converter codigo para string se necessário
      let codigoValue: string | null = null;
      const codigoField = petRaw[0].codigo;
      if (codigoField != null && codigoField !== undefined) {
        // O campo numeric pode vir como objeto ou string
        if (typeof codigoField === 'object' && codigoField !== null) {
          // Se for um objeto (como Decimal do Drizzle), pegar o valor
          codigoValue = (codigoField as any).toString ? (codigoField as any).toString() : String(codigoField);
        } else {
          codigoValue = String(codigoField);
        }
      }
      const pet = {
        ...petRaw[0],
        codigo: codigoValue,
      };

      return {
        success: true,
        pet,
      };
    } catch (error) {
      console.error("Erro ao buscar pet por código:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao buscar pet";
      return {
        error: errorMessage,
      };
    }
  });

