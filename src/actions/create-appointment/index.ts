"use server";

import { db } from "@/db";
import { appointmentsTable, petsTable, doctorsTable, clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

import { createAppointmentSchema } from "./schema";

export const createAppointmentAction = actionClient
  .schema(createAppointmentSchema)
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

      const { petCodigo, doctorId, appointmentDate, appointmentTime, priceInCents } = parsedInput;

      // Buscar pet pelo código
      const petRaw = await db
        .select({
          id: petsTable.id,
        })
        .from(petsTable)
        .where(eq(petsTable.codigo, petCodigo))
        .limit(1);

      if (petRaw.length === 0) {
        return {
          error: "Pet não encontrado com o código informado",
        };
      }

      const petId = petRaw[0].id;

      // Verificar se o veterinário existe e pertence a uma clínica do usuário
      const doctorRaw = await db
        .select({
          id: doctorsTable.id,
          clinicId: doctorsTable.clinicId,
        })
        .from(doctorsTable)
        .where(eq(doctorsTable.id, doctorId))
        .limit(1);

      if (doctorRaw.length === 0) {
        return {
          error: "Veterinário não encontrado",
        };
      }

      const doctor = doctorRaw[0];

      // Verificar se a clínica pertence ao usuário logado
      const clinicRaw = await db
        .select({
          id: clinicsTable.id,
          userId: clinicsTable.userId,
        })
        .from(clinicsTable)
        .where(eq(clinicsTable.id, doctor.clinicId))
        .limit(1);

      if (clinicRaw.length === 0 || clinicRaw[0].userId !== session.user.id) {
        return {
          error: "Você não tem permissão para criar agendamentos para este veterinário",
        };
      }

      // Verificar se já existe um agendamento no mesmo horário
      const existingAppointment = await db
        .select({
          id: appointmentsTable.id,
        })
        .from(appointmentsTable)
        .where(
          and(
            eq(appointmentsTable.doctorId, doctorId),
            eq(appointmentsTable.appointmentDate, appointmentDate),
            eq(appointmentsTable.appointmentTime, appointmentTime)
          )
        )
        .limit(1);

      if (existingAppointment.length > 0) {
        return {
          error: "Já existe um agendamento para este veterinário no horário selecionado",
        };
      }

      // Criar o agendamento
      const appointmentId = randomUUID();

      await db.insert(appointmentsTable).values({
        id: appointmentId,
        petId,
        doctorId,
        appointmentDate,
        appointmentTime,
        priceInCents,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createdAppointment = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.id, appointmentId))
        .limit(1);

      return {
        success: true,
        appointment: createdAppointment[0],
      };
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao criar agendamento";
      
      // Verificar se é erro de constraint unique
      if (errorMessage.includes("UNIQUE constraint") || errorMessage.includes("duplicate key")) {
        return {
          error: "Já existe um agendamento para este veterinário no horário selecionado",
        };
      }
      
      return {
        error: errorMessage,
      };
    }
  });

