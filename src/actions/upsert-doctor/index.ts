"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { doctorsTable, clinicsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";

import { upsertDoctorSchema } from "./schema";

export const upsertDoctorAction = actionClient
  .schema(upsertDoctorSchema)
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
        id,
        clinicId,
        name,
        email,
        availableFromWeekDay,
        availableToWeekDay,
        availableFromTime,
        availableToTime,
        avatarImageUrl,
        appointmentPriceInCents,
      } = parsedInput;

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

      // Verificar se a clínica pertence ao usuário logado
      if (clinic[0].userId !== session.user.id) {
        return {
          error: "Você não tem permissão para adicionar veterinários nesta clínica",
        };
      }

      // Se estiver editando, verificar se o veterinário existe e pertence à clínica
      if (id) {
        const existingDoctor = await db
          .select()
          .from(doctorsTable)
          .where(eq(doctorsTable.id, id))
          .limit(1);

        if (existingDoctor.length === 0) {
          return {
            error: "Veterinário não encontrado",
          };
        }

        if (existingDoctor[0].clinicId !== clinicId) {
          return {
            error: "Veterinário não pertence a esta clínica",
          };
        }

        // Verificar se o email já está em uso por outro veterinário
        if (existingDoctor[0].email !== email) {
          const emailExists = await db
            .select()
            .from(doctorsTable)
            .where(eq(doctorsTable.email, email))
            .limit(1);

          if (emailExists.length > 0) {
            return {
              error: "E-mail já está em uso",
            };
          }
        }

        // Atualizar veterinário
        await db
          .update(doctorsTable)
          .set({
            name,
            email,
            availableFromWeekDay,
            availableToWeekDay,
            availableFromTime,
            availableToTime,
            avatarImageUrl: avatarImageUrl || null,
            appointmentPriceInCents,
            updatedAt: new Date(),
          })
          .where(eq(doctorsTable.id, id));

        return {
          success: true,
          doctor: {
            id,
            clinicId,
            name,
            email,
            availableFromWeekDay,
            availableToWeekDay,
            availableFromTime,
            availableToTime,
            avatarImageUrl,
            appointmentPriceInCents,
          },
        };
      } else {
        // Verificar se o email já está em uso
        const emailExists = await db
          .select()
          .from(doctorsTable)
          .where(eq(doctorsTable.email, email))
          .limit(1);

        if (emailExists.length > 0) {
          return {
            error: "E-mail já está em uso",
          };
        }

        // Criar novo veterinário
        const doctorId = randomUUID();

        await db.insert(doctorsTable).values({
          id: doctorId,
          clinicId,
          name,
          email,
          availableFromWeekDay,
          availableToWeekDay,
          availableFromTime,
          availableToTime,
          avatarImageUrl: avatarImageUrl || null,
          appointmentPriceInCents,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return {
          success: true,
          doctor: {
            id: doctorId,
            clinicId,
            name,
            email,
            availableFromWeekDay,
            availableToWeekDay,
            availableFromTime,
            availableToTime,
            avatarImageUrl,
            appointmentPriceInCents,
          },
        };
      }
    } catch (error) {
      console.error("Erro ao salvar veterinário:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      return {
        error: `Erro ao salvar veterinário: ${errorMessage}`,
      };
    }
  });

