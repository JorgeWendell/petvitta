"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { deleteAppointmentSchema } from "./schema";

export const deleteAppointmentAction = actionClient
  .schema(deleteAppointmentSchema)
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

      const { id, clinicId } = parsedInput;

      // Verificar se a clínica existe e pertence ao usuário logado
      const clinic = await db
        .select()
        .from(clinicsTable)
        .where(eq(clinicsTable.id, clinicId))
        .limit(1);

      if (clinic.length === 0) {
        return {
          error: "Clínica não encontrada",
        };
      }

      if (clinic[0].userId !== session.user.id) {
        return {
          error: "Você não tem permissão para acessar esta clínica",
        };
      }

      // Verificar se o agendamento existe e pertence a um veterinário da clínica
      const appointment = await db
        .select({
          id: appointmentsTable.id,
          doctorId: appointmentsTable.doctorId,
        })
        .from(appointmentsTable)
        .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
        .where(
          and(
            eq(appointmentsTable.id, id),
            eq(doctorsTable.clinicId, clinicId)
          )
        )
        .limit(1);

      if (appointment.length === 0) {
        return {
          error: "Agendamento não encontrado ou não pertence a esta clínica",
        };
      }

      // Excluir o agendamento
      await db
        .delete(appointmentsTable)
        .where(eq(appointmentsTable.id, id));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido ao excluir agendamento";
      return {
        error: errorMessage,
      };
    }
  });

