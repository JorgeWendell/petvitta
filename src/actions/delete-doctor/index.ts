"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { doctorsTable, clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { deleteDoctorSchema } from "./schema";

export const deleteDoctorAction = actionClient
  .schema(deleteDoctorSchema)
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

      const { id } = parsedInput;

      // Buscar o veterinário
      const doctor = await db
        .select()
        .from(doctorsTable)
        .where(eq(doctorsTable.id, id))
        .limit(1);

      if (doctor.length === 0) {
        return {
          error: "Veterinário não encontrado",
        };
      }

      // Verificar se a clínica do veterinário pertence ao usuário logado
      const clinic = await db
        .select()
        .from(clinicsTable)
        .where(eq(clinicsTable.id, doctor[0].clinicId))
        .limit(1);

      if (clinic.length === 0) {
        return {
          error: "Clínica não encontrada",
        };
      }

      if (clinic[0].userId !== session.user.id) {
        return {
          error: "Você não tem permissão para deletar este veterinário",
        };
      }

      // Deletar veterinário
      await db.delete(doctorsTable).where(eq(doctorsTable.id, id));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Erro ao deletar veterinário:", error);
      return {
        error: "Erro ao deletar veterinário",
      };
    }
  });

