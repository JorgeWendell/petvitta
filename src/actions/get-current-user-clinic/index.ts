"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { getCurrentUserClinicSchema } from "./schema";

export const getCurrentUserClinicAction = actionClient
  .schema(getCurrentUserClinicSchema)
  .action(async () => {
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session?.user) {
        return {
          error: "Usuário não autenticado",
        };
      }

      // Buscar a clínica do usuário logado
      const clinic = await db
        .select({
          id: clinicsTable.id,
          name: clinicsTable.name,
          cnpj: clinicsTable.cnpj,
          phone: clinicsTable.phone,
          email: clinicsTable.email,
          address: clinicsTable.address,
          city: clinicsTable.city,
          state: clinicsTable.state,
          zipCode: clinicsTable.zipCode,
          userId: clinicsTable.userId,
          status: clinicsTable.status,
          createdAt: clinicsTable.createdAt,
          updatedAt: clinicsTable.updatedAt,
        })
        .from(clinicsTable)
        .where(eq(clinicsTable.userId, session.user.id))
        .limit(1);

      if (clinic.length === 0) {
        return {
          error: "Clínica não encontrada para este usuário. Por favor, cadastre uma clínica primeiro.",
        };
      }

      return {
        success: true,
        clinic: clinic[0],
      };
    } catch (error) {
      console.error("Erro ao buscar clínica do usuário:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao buscar clínica: ${errorMessage}`,
      };
    }
  });

