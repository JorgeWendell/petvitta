"use server";

import { db } from "@/db";
import { petsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { and, count, desc, eq, ilike } from "drizzle-orm";

import { listPetsSchema } from "./schema";

export const listPetsAction = actionClient
  .schema(listPetsSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { page, limit, search, status, tutorId } = parsedInput;

      const offset = (page - 1) * limit;

      const conditions = [];

      if (search) {
        conditions.push(ilike(petsTable.name, `%${search}%`));
      }

      if (status) {
        conditions.push(eq(petsTable.status, status));
      }

      if (tutorId) {
        conditions.push(eq(petsTable.tutorId, tutorId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [petsRaw, totalCount] = await Promise.all([
        db
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
          })
          .from(petsTable)
          .where(whereClause)
          .limit(limit)
          .offset(offset)
          .orderBy(desc(petsTable.createdAt)),
        db
          .select({ count: count() })
          .from(petsTable)
          .where(whereClause),
      ]);

      // Converter codigo para string se necessário
      const pets = petsRaw.map((pet) => {
        let codigoValue: string | null = null;
        const codigoField = pet.codigo;
        if (codigoField != null && codigoField !== undefined) {
          // O campo numeric pode vir como objeto ou string
          if (typeof codigoField === 'object' && codigoField !== null) {
            // Se for um objeto (como Decimal do Drizzle), pegar o valor
            codigoValue = (codigoField as any).toString ? (codigoField as any).toString() : String(codigoField);
          } else {
            codigoValue = String(codigoField);
          }
        }
        return {
          ...pet,
          codigo: codigoValue,
        };
      });

      return {
        pets,
        pagination: {
          page,
          limit,
          total: totalCount[0]?.count ?? 0,
          totalPages: Math.ceil((totalCount[0]?.count ?? 0) / limit),
        },
      };
    } catch (error) {
      console.error("Erro ao listar pets:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao listar pets";
      
      // Verificar se é erro de coluna não encontrada
      if (errorMessage.includes("does not exist") || errorMessage.includes("não existe") || errorMessage.includes("column")) {
        return {
          error: "Coluna não encontrada. Execute a migração do banco de dados: npx tsx src/db/migrations/migrate-pets-codigo.ts",
        };
      }
      
      return {
        error: errorMessage,
      };
    }
  });

