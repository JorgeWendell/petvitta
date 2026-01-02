"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { doctorsTable, clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq, and, or, like, count } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { listDoctorsSchema } from "./schema";

export const listDoctorsAction = actionClient
  .schema(listDoctorsSchema)
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

      const { clinicId, page, limit, search } = parsedInput;

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

      // Construir condições de busca
      const conditions = [eq(doctorsTable.clinicId, clinicId)];

      if (search) {
        conditions.push(
          or(
            like(doctorsTable.name, `%${search}%`),
            like(doctorsTable.email, `%${search}%`)
          )!
        );
      }

      // Buscar veterinários
      const doctors = await db
        .select({
          id: doctorsTable.id,
          clinicId: doctorsTable.clinicId,
          name: doctorsTable.name,
          email: doctorsTable.email,
          availableFromWeekDay: doctorsTable.availableFromWeekDay,
          availableToWeekDay: doctorsTable.availableToWeekDay,
          availableFromTime: doctorsTable.availableFromTime,
          availableToTime: doctorsTable.availableToTime,
          avatarImageUrl: doctorsTable.avatarImageUrl,
          appointmentPriceInCents: doctorsTable.appointmentPriceInCents,
          createdAt: doctorsTable.createdAt,
          updatedAt: doctorsTable.updatedAt,
        })
        .from(doctorsTable)
        .where(and(...conditions))
        .limit(limit)
        .offset((page - 1) * limit);

      // Contar total
      const totalResult = await db
        .select({ count: count() })
        .from(doctorsTable)
        .where(and(...conditions));

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        doctors,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Erro ao listar veterinários:", error);
      return {
        error: "Erro ao listar veterinários",
      };
    }
  });

