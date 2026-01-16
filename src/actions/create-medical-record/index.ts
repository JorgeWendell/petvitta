"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import {
  medicalRecordsTable,
  prescriptionsTable,
  examsTable,
  vaccinesTable,
  petsTable,
  doctorsTable,
  clinicsTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

import { createMedicalRecordSchema } from "./schema";

export const createMedicalRecordAction = actionClient
  .schema(createMedicalRecordSchema)
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

      const {
        petId,
        doctorId,
        anamnese,
        clinicalDiagnosis,
        isReturn,
        prescriptions,
        exams,
        vaccines,
      } = parsedInput;

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

      // Verificar se o médico existe e pertence à clínica do usuário
      const doctor = await db
        .select({
          id: doctorsTable.id,
          clinicId: doctorsTable.clinicId,
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.id, doctorId))
        .limit(1);

      if (doctor.length === 0) {
        return {
          error: "Médico não encontrado",
        };
      }

      // Verificar se a clínica pertence ao usuário logado
      const clinic = await db
        .select()
        .from(clinicsTable)
        .where(eq(clinicsTable.id, doctor[0].clinicId))
        .limit(1);

      if (clinic.length === 0 || clinic[0].userId !== session.user.id) {
        return {
          error: "Você não tem permissão para criar prontuários nesta clínica",
        };
      }

      // Criar o prontuário médico
      const medicalRecordId = randomUUID();

      const medicalRecordValues = {
        id: medicalRecordId,
        petId,
        doctorId,
        chiefComplaint: anamnese.chiefComplaint || null,
        reportedSymptoms: anamnese.reportedSymptoms || null,
        medicationUse: anamnese.medicationUse || null,
        temperature: anamnese.temperature || null,
        heartRate: anamnese.heartRate ? parseInt(anamnese.heartRate, 10) : null,
        respiratoryRate: anamnese.respiratoryRate
          ? parseInt(anamnese.respiratoryRate, 10)
          : null,
        mucosa: anamnese.mucosa || null,
        hydration: anamnese.hydration || null,
        clinicalDiagnosis: clinicalDiagnosis || null,
        isReturn: isReturn || false,
      };

      await db.insert(medicalRecordsTable).values(medicalRecordValues);

      // Inserir prescrições
      if (prescriptions.length > 0) {
        await db.insert(prescriptionsTable).values(
          prescriptions.map((prescription) => ({
            id: randomUUID(),
            medicalRecordId,
            medication: prescription.medication,
            dosage: prescription.dosage,
            frequency: prescription.frequency,
            duration: prescription.duration,
          }))
        );
      }

      // Inserir exames
      if (exams.length > 0) {
        await db.insert(examsTable).values(
          exams.map((exam) => ({
            id: randomUUID(),
            medicalRecordId,
            examName: exam.examName,
            result: exam.result || null,
            examDate: exam.examDate || null,
          }))
        );
      }

      // Inserir vacinas
      if (vaccines.length > 0) {
        await db.insert(vaccinesTable).values(
          vaccines.map((vaccine) => ({
            id: randomUUID(),
            medicalRecordId,
            vaccineName: vaccine.vaccineName,
            dose: vaccine.dose,
            vaccineDate: vaccine.vaccineDate,
            nextDoseDate: vaccine.nextDoseDate || null,
          }))
        );
      }

      return {
        success: true,
        medicalRecordId,
      };
    } catch (error) {
      console.error("Erro ao criar prontuário médico:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao criar prontuário médico: ${errorMessage}`,
      };
    }
  });

