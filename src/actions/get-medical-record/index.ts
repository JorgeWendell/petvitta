"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import {
  medicalRecordsTable,
  prescriptionsTable,
  examsTable,
  vaccinesTable,
  doctorsTable,
  clinicsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { getMedicalRecordSchema } from "./schema";

export const getMedicalRecordAction = actionClient
  .schema(getMedicalRecordSchema)
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

      const { medicalRecordId } = parsedInput;

      // Buscar prontuário com joins
      const medicalRecord = await db
        .select({
          id: medicalRecordsTable.id,
          petId: medicalRecordsTable.petId,
          doctorId: medicalRecordsTable.doctorId,
          chiefComplaint: medicalRecordsTable.chiefComplaint,
          reportedSymptoms: medicalRecordsTable.reportedSymptoms,
          medicationUse: medicalRecordsTable.medicationUse,
          temperature: medicalRecordsTable.temperature,
          heartRate: medicalRecordsTable.heartRate,
          respiratoryRate: medicalRecordsTable.respiratoryRate,
          mucosa: medicalRecordsTable.mucosa,
          hydration: medicalRecordsTable.hydration,
          clinicalDiagnosis: medicalRecordsTable.clinicalDiagnosis,
          isReturn: medicalRecordsTable.isReturn,
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
        .where(eq(medicalRecordsTable.id, medicalRecordId))
        .limit(1);

      if (medicalRecord.length === 0) {
        return {
          error: "Prontuário não encontrado",
        };
      }

      // Buscar prescrições
      const prescriptions = await db
        .select()
        .from(prescriptionsTable)
        .where(eq(prescriptionsTable.medicalRecordId, medicalRecordId));

      // Buscar exames
      const exams = await db
        .select()
        .from(examsTable)
        .where(eq(examsTable.medicalRecordId, medicalRecordId));

      // Buscar vacinas
      const vaccines = await db
        .select()
        .from(vaccinesTable)
        .where(eq(vaccinesTable.medicalRecordId, medicalRecordId));

      return {
        success: true,
        medicalRecord: {
          ...medicalRecord[0],
          prescriptions,
          exams,
          vaccines,
        },
      };
    } catch (error) {
      console.error("Erro ao buscar prontuário:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao buscar prontuário: ${errorMessage}`,
      };
    }
  });

