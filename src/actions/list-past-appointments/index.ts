"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import {
  appointmentsTable,
  petsTable,
  doctorsTable,
  clinicsTable,
  plansTable,
} from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";
import { eq, and, like, count, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

import { listPastAppointmentsSchema } from "./schema";

export const listPastAppointmentsAction = actionClient
  .schema(listPastAppointmentsSchema)
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

      // Filtrar apenas agendamentos passados (data < hoje)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
      conditions.push(sql`${appointmentsTable.appointmentDate}::text < ${todayStr}`);

      if (search) {
        // Buscar por nome do pet
        conditions.push(like(petsTable.name, `%${search}%`));
      }

      // Buscar agendamentos com joins
      const appointments = await db
        .select({
          id: appointmentsTable.id,
          petId: appointmentsTable.petId,
          doctorId: appointmentsTable.doctorId,
          appointmentDate: appointmentsTable.appointmentDate,
          appointmentTime: appointmentsTable.appointmentTime,
          priceInCents: appointmentsTable.priceInCents,
          status: appointmentsTable.status,
          createdAt: appointmentsTable.createdAt,
          updatedAt: appointmentsTable.updatedAt,
          // Pet data
          petCodigo: petsTable.codigo,
          petName: petsTable.name,
          petPlanId: petsTable.planId,
          // Plan data
          planName: plansTable.name,
          // Doctor data
          doctorName: doctorsTable.name,
        })
        .from(appointmentsTable)
        .innerJoin(petsTable, eq(appointmentsTable.petId, petsTable.id))
        .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
        .leftJoin(plansTable, eq(petsTable.planId, plansTable.id))
        .where(and(...conditions))
        .orderBy(desc(appointmentsTable.appointmentDate), desc(appointmentsTable.appointmentTime))
        .limit(limit)
        .offset((page - 1) * limit);

      // Contar total
      const totalResult = await db
        .select({ count: count() })
        .from(appointmentsTable)
        .innerJoin(petsTable, eq(appointmentsTable.petId, petsTable.id))
        .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
        .where(and(...conditions));

      const total = totalResult[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);

      // Converter codigo para string se necessário
      const formattedAppointments = appointments.map((apt) => {
        let codigoValue: string | null = null;
        const codigoField = apt.petCodigo;
        if (codigoField != null && codigoField !== undefined) {
          if (typeof codigoField === "object" && codigoField !== null) {
            codigoValue = (codigoField as any).toString
              ? (codigoField as any).toString()
              : String(codigoField);
          } else {
            codigoValue = String(codigoField);
          }
        }
        return {
          ...apt,
          petCodigo: codigoValue,
        };
      });

      return {
        success: true,
        appointments: formattedAppointments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Erro ao listar agendamentos passados:", error);
      return {
        error: "Erro ao listar agendamentos passados",
      };
    }
  });

