"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { updateAppointmentStatusSchema } from "./schema";

export const updateAppointmentStatusAction = actionClient
  .schema(updateAppointmentStatusSchema)
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

      const { appointmentId, status } = parsedInput;

      // Buscar o agendamento com join para verificar permissões
      const appointment = await db
        .select({
          id: appointmentsTable.id,
          doctorId: appointmentsTable.doctorId,
          clinicId: doctorsTable.clinicId,
        })
        .from(appointmentsTable)
        .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
        .where(eq(appointmentsTable.id, appointmentId))
        .limit(1);

      if (appointment.length === 0) {
        return {
          error: "Agendamento não encontrado",
        };
      }

      // Verificar se a clínica pertence ao usuário logado
      const clinic = await db
        .select()
        .from(clinicsTable)
        .where(eq(clinicsTable.id, appointment[0].clinicId))
        .limit(1);

      if (clinic.length === 0 || clinic[0].userId !== session.user.id) {
        return {
          error: "Você não tem permissão para atualizar este agendamento",
        };
      }

      // Atualizar o status
      await db
        .update(appointmentsTable)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(appointmentsTable.id, appointmentId));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao atualizar status do agendamento:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao atualizar status: ${errorMessage}`,
      };
    }
  });

