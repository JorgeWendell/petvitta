"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import {
  medicalRecordsTable,
  petsTable,
  doctorsTable,
  clinicsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { listMedicalRecordsSchema } from "./schema";

export const listMedicalRecordsAction = actionClient
  .schema(listMedicalRecordsSchema)
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

      const { petId } = parsedInput;

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

      // Buscar prontuários com joins
      const medicalRecords = await db
        .select({
          id: medicalRecordsTable.id,
          petId: medicalRecordsTable.petId,
          doctorId: medicalRecordsTable.doctorId,
          createdAt: medicalRecordsTable.createdAt,
          updatedAt: medicalRecordsTable.updatedAt,
          // Doctor data
          doctorName: doctorsTable.name,
          // Clinic data
          clinicId: clinicsTable.id,
          clinicName: clinicsTable.name,
        })
        .from(medicalRecordsTable)
        .innerJoin(doctorsTable, eq(medicalRecordsTable.doctorId, doctorsTable.id))
        .innerJoin(clinicsTable, eq(doctorsTable.clinicId, clinicsTable.id))
        .where(eq(medicalRecordsTable.petId, petId))
        .orderBy(desc(medicalRecordsTable.createdAt));

      return {
        success: true,
        medicalRecords,
      };
    } catch (error) {
      console.error("Erro ao listar prontuários:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao listar prontuários: ${errorMessage}`,
      };
    }
  });

