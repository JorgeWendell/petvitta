"use server";

import { db } from "@/db";
import { clinicsTable, usersTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { usageByClinicReportSchema } from "./schema";

export const usageByClinicReportAction = actionClient
  .schema(usageByClinicReportSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { month, year } = parsedInput;

      const clinics = await db
        .select({
          clinicId: clinicsTable.id,
          clinicName: clinicsTable.name,
          clinicCnpj: clinicsTable.cnpj,
          clinicPhone: clinicsTable.phone,
          clinicEmail: clinicsTable.email,
          clinicCity: clinicsTable.city,
          clinicState: clinicsTable.state,
          clinicStatus: clinicsTable.status,
          userName: usersTable.name,
          userEmail: usersTable.email,
        })
        .from(clinicsTable)
        .innerJoin(usersTable, eq(clinicsTable.userId, usersTable.id))
        .where(eq(clinicsTable.status, "ATIVO"))
        .orderBy(clinicsTable.name);

      return {
        data: clinics,
      };
    } catch (error) {
      console.error("Erro ao gerar relatório de uso por clínica:", error);
      return {
        error: "Erro interno do servidor ao gerar relatório. Verifique os logs para mais detalhes.",
      };
    }
  });

