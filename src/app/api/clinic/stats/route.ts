import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { and, count, gte, lte, eq, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { db } from "@/db";
import {
  clinicsTable,
  doctorsTable,
  medicalRecordsTable,
  appointmentsTable,
  vaccinesTable,
  petVaccinesTable,
  petsTable,
} from "@/db/schema";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const permissions = await getUserPermissions(session.user.id);

    if (!permissions) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (permissions.role !== "CLINIC") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas clínicas podem acessar" },
        { status: 403 }
      );
    }

    // Buscar a clínica do usuário
    const clinic = await db
      .select()
      .from(clinicsTable)
      .where(eq(clinicsTable.userId, session.user.id))
      .limit(1);

    if (clinic.length === 0) {
      return NextResponse.json(
        { error: "Clínica não encontrada" },
        { status: 404 }
      );
    }

    const clinicId = clinic[0].id;

    const searchParams = request.nextUrl.searchParams;
    const month = parseInt(searchParams.get("month") || "0");
    const year = parseInt(searchParams.get("year") || "0");

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      );
    }

    // Calcular início e fim do mês selecionado
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];

    // Calcular início e fim do mês anterior
    const previousMonth = month === 1 ? 12 : month - 1;
    const previousYear = month === 1 ? year - 1 : year;
    const previousStartDate = new Date(previousYear, previousMonth - 1, 1);
    const previousEndDate = new Date(
      previousYear,
      previousMonth,
      0,
      23,
      59,
      59,
      999
    );
    const previousStartDateString = previousStartDate.toISOString().split('T')[0];
    const previousEndDateString = previousEndDate.toISOString().split('T')[0];

    // Contar consultas (medical records) do mês atual
    const consultas = await db
      .select({ count: count() })
      .from(medicalRecordsTable)
      .innerJoin(doctorsTable, eq(medicalRecordsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(medicalRecordsTable.createdAt, startDate),
          lte(medicalRecordsTable.createdAt, endDate)
        )
      );

    // Contar consultas do mês anterior
    const consultasAnterior = await db
      .select({ count: count() })
      .from(medicalRecordsTable)
      .innerJoin(doctorsTable, eq(medicalRecordsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(medicalRecordsTable.createdAt, previousStartDate),
          lte(medicalRecordsTable.createdAt, previousEndDate)
        )
      );

    // Contar agendamentos do mês atual
    const agendamentos = await db
      .select({ count: count() })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(appointmentsTable.appointmentDate, startDateString),
          lte(appointmentsTable.appointmentDate, endDateString)
        )
      );

    // Contar agendamentos do mês anterior
    const agendamentosAnterior = await db
      .select({ count: count() })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(appointmentsTable.appointmentDate, previousStartDateString),
          lte(appointmentsTable.appointmentDate, previousEndDateString)
        )
      );

    // Calcular faturamento do mês atual (soma dos priceInCents dos appointments)
    const faturamento = await db
      .select({
        total: sql<number>`COALESCE(SUM(${appointmentsTable.priceInCents}), 0)`,
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(appointmentsTable.appointmentDate, startDateString),
          lte(appointmentsTable.appointmentDate, endDateString)
        )
      );

    // Calcular faturamento do mês anterior
    const faturamentoAnterior = await db
      .select({
        total: sql<number>`COALESCE(SUM(${appointmentsTable.priceInCents}), 0)`,
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(appointmentsTable.appointmentDate, previousStartDateString),
          lte(appointmentsTable.appointmentDate, previousEndDateString)
        )
      );

    // Contar vacinas do mês atual (vacinas vinculadas a medical records dos médicos da clínica)
    const vacinasFromRecords = await db
      .select({ count: count() })
      .from(vaccinesTable)
      .innerJoin(
        medicalRecordsTable,
        eq(vaccinesTable.medicalRecordId, medicalRecordsTable.id)
      )
      .innerJoin(doctorsTable, eq(medicalRecordsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(vaccinesTable.vaccineDate, startDateString),
          lte(vaccinesTable.vaccineDate, endDateString)
        )
      );

    // Contar vacinas do mês atual (vacinas vinculadas diretamente aos pets que têm appointments com médicos da clínica)
    const vacinasFromPets = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${petVaccinesTable.id})`,
      })
      .from(petVaccinesTable)
      .innerJoin(petsTable, eq(petVaccinesTable.petId, petsTable.id))
      .innerJoin(appointmentsTable, eq(petsTable.id, appointmentsTable.petId))
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(petVaccinesTable.vaccineDate, startDateString),
          lte(petVaccinesTable.vaccineDate, endDateString)
        )
      );

    // Contar vacinas do mês anterior (vacinas vinculadas a medical records)
    const vacinasAnteriorFromRecords = await db
      .select({ count: count() })
      .from(vaccinesTable)
      .innerJoin(
        medicalRecordsTable,
        eq(vaccinesTable.medicalRecordId, medicalRecordsTable.id)
      )
      .innerJoin(doctorsTable, eq(medicalRecordsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(vaccinesTable.vaccineDate, previousStartDateString),
          lte(vaccinesTable.vaccineDate, previousEndDateString)
        )
      );

    // Contar vacinas do mês anterior (vacinas vinculadas diretamente aos pets)
    const vacinasAnteriorFromPets = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${petVaccinesTable.id})`,
      })
      .from(petVaccinesTable)
      .innerJoin(petsTable, eq(petVaccinesTable.petId, petsTable.id))
      .innerJoin(appointmentsTable, eq(petsTable.id, appointmentsTable.petId))
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(petVaccinesTable.vaccineDate, previousStartDateString),
          lte(petVaccinesTable.vaccineDate, previousEndDateString)
        )
      );

    // Calcular porcentagem de variação
    const calcularVariacao = (
      atual: number,
      anterior: number
    ): { valor: number; porcentagem: number; isPositive: boolean } => {
      if (anterior === 0) {
        return {
          valor: atual,
          porcentagem: atual > 0 ? 100 : 0,
          isPositive: atual > 0,
        };
      }
      const porcentagem = ((atual - anterior) / anterior) * 100;
      return {
        valor: atual,
        porcentagem: Math.abs(porcentagem),
        isPositive: porcentagem >= 0,
      };
    };

    const consultasCount = consultas[0]?.count || 0;
    const consultasAnteriorCount = consultasAnterior[0]?.count || 0;
    const agendamentosCount = agendamentos[0]?.count || 0;
    const agendamentosAnteriorCount = agendamentosAnterior[0]?.count || 0;
    const faturamentoCount = Number(faturamento[0]?.total || 0);
    const faturamentoAnteriorCount = Number(faturamentoAnterior[0]?.total || 0);
    const vacinasCount =
      Number(vacinasFromRecords[0]?.count || 0) +
      Number(vacinasFromPets[0]?.count || 0);
    const vacinasAnteriorCount =
      Number(vacinasAnteriorFromRecords[0]?.count || 0) +
      Number(vacinasAnteriorFromPets[0]?.count || 0);

    // Calcular faturamento histórico (últimos 3 meses para o gráfico)
    const threeMonthsAgo = new Date(year, month - 3, 1);
    const threeMonthsAgoString = threeMonthsAgo.toISOString().split('T')[0];
    const faturamentoHistorico = await db
      .select({
        date: sql<string>`TO_CHAR(${appointmentsTable.appointmentDate}, 'DD/MM')`,
        total: sql<number>`COALESCE(SUM(${appointmentsTable.priceInCents}), 0)`,
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(doctorsTable.clinicId, clinicId),
          gte(appointmentsTable.appointmentDate, threeMonthsAgoString),
          lte(appointmentsTable.appointmentDate, endDateString)
        )
      )
      .groupBy(sql`TO_CHAR(${appointmentsTable.appointmentDate}, 'DD/MM')`)
      .orderBy(sql`MIN(${appointmentsTable.appointmentDate})`);

    return NextResponse.json({
      consultas: calcularVariacao(consultasCount, consultasAnteriorCount),
      agendamentos: calcularVariacao(
        agendamentosCount,
        agendamentosAnteriorCount
      ),
      faturamento: calcularVariacao(
        faturamentoCount,
        faturamentoAnteriorCount
      ),
      vacinas: calcularVariacao(vacinasCount, vacinasAnteriorCount),
      faturamentoHistorico: faturamentoHistorico.map((item) => ({
        date: item.date,
        faturamento: Number(item.total) / 100, // Converter centavos para reais
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas da clínica:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

