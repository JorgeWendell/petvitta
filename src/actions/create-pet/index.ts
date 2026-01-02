"use server";

import { db } from "@/db";
import { petsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { createPetSchema } from "./schema";

export const createPetAction = actionClient
  .schema(createPetSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { codigo, name, species, breed, dateOfBirth, gender, status, tutorId, planId } = parsedInput;

      // Verificar se o tutor existe
      const tutor = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, tutorId))
        .limit(1);

      if (tutor.length === 0) {
        return {
          error: "Tutor não encontrado",
        };
      }

      const petId = randomUUID();

      // Gerar código aleatório de 16 dígitos se não fornecido
      const codigoToInsert = codigo || Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();

      const dateOfBirthValue = dateOfBirth ? new Date(dateOfBirth) : null;

      await db.insert(petsTable).values({
        id: petId,
        codigo: codigoToInsert,
        name,
        species,
        breed: breed || null,
        dateOfBirth: dateOfBirthValue,
        gender: gender || null,
        status,
        tutorId,
        planId: planId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdPetRaw = await db
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
        .where(eq(petsTable.id, petId))
        .limit(1);

      if (createdPetRaw.length === 0) {
        return {
          error: "Erro ao recuperar pet criado",
        };
      }

      // Converter codigo para string se necessário
      let codigoValue: string | null = null;
      const codigoField = createdPetRaw[0].codigo;
      if (codigoField != null && codigoField !== undefined) {
        // O campo numeric pode vir como objeto ou string
        if (typeof codigoField === 'object' && codigoField !== null) {
          // Se for um objeto (como Decimal do Drizzle), pegar o valor
          codigoValue = (codigoField as any).toString ? (codigoField as any).toString() : String(codigoField);
        } else {
          codigoValue = String(codigoField);
        }
      }
      const createdPet = {
        ...createdPetRaw[0],
        codigo: codigoValue,
      };

      return {
        success: true,
        pet: createdPet,
      };
    } catch (error) {
      console.error("Erro ao criar pet:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar pet";
      
      // Verificar se é erro de tabela não encontrada
      if (errorMessage.includes("does not exist") || errorMessage.includes("não existe")) {
        return {
          error: "Tabela de pets não encontrada. Execute a migração do banco de dados: npx drizzle-kit push",
        };
      }
      
      return {
        error: errorMessage,
      };
    }
  });

