"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { petVaccinesTable, petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq, count, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { listPetVaccinesSchema } from "./schema";

export const listPetVaccinesAction = actionClient
  .schema(listPetVaccinesSchema)
  .action(async ({ parsedInput }) => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return {
          error: "Usuário não autenticado",
        };
      }

      const { petId, page, limit } = parsedInput;

      // Verificar se o pet existe
      const pet = await db
        .select()
        .from(petsTable)
        .where(eq(petsTable.id, petId))
        .limit(1);

      if (pet.length === 0) {
        return {
          error: "Pet não encontrado",
        };
      }

      // Buscar vacinas com paginação
      const vaccines = await db
        .select({
          id: petVaccinesTable.id,
          vaccineName: petVaccinesTable.vaccineName,
          dose: petVaccinesTable.dose,
          vaccineDate: petVaccinesTable.vaccineDate,
          nextDoseDate: petVaccinesTable.nextDoseDate,
          createdAt: petVaccinesTable.createdAt,
        })
        .from(petVaccinesTable)
        .where(eq(petVaccinesTable.petId, petId))
        .orderBy(desc(petVaccinesTable.vaccineDate))
        .limit(limit)
        .offset((page - 1) * limit);

      // Contar total
      const totalResult = await db
        .select({ count: count() })
        .from(petVaccinesTable)
        .where(eq(petVaccinesTable.petId, petId));

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        vaccines,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Erro ao listar vacinas:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao listar vacinas: ${errorMessage}`,
      };
    }
  });

