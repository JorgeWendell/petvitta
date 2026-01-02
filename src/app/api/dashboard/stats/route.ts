import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { and, count, gte, lte } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { db } from "@/db";
import { petsTable, clinicsTable } from "@/db/schema";

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

    if (permissions.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem acessar" },
        { status: 403 }
      );
    }

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

    // Contar novos pets no mês selecionado
    const novosPets = await db
      .select({ count: count() })
      .from(petsTable)
      .where(
        and(
          gte(petsTable.createdAt, startDate),
          lte(petsTable.createdAt, endDate)
        )
      );

    // Contar novos pets no mês anterior
    const novosPetsAnterior = await db
      .select({ count: count() })
      .from(petsTable)
      .where(
        and(
          gte(petsTable.createdAt, previousStartDate),
          lte(petsTable.createdAt, previousEndDate)
        )
      );

    // Contar novas clínicas no mês selecionado
    const novasClinicas = await db
      .select({ count: count() })
      .from(clinicsTable)
      .where(
        and(
          gte(clinicsTable.createdAt, startDate),
          lte(clinicsTable.createdAt, endDate)
        )
      );

    // Contar novas clínicas no mês anterior
    const novasClinicasAnterior = await db
      .select({ count: count() })
      .from(clinicsTable)
      .where(
        and(
          gte(clinicsTable.createdAt, previousStartDate),
          lte(clinicsTable.createdAt, previousEndDate)
        )
      );

    // Calcular porcentagem de variação
    const calcularVariacao = (
      atual: number,
      anterior: number
    ): { valor: number; porcentagem: number; isPositive: boolean } => {
      if (anterior === 0) {
        return { valor: atual, porcentagem: atual > 0 ? 100 : 0, isPositive: atual > 0 };
      }
      const porcentagem = ((atual - anterior) / anterior) * 100;
      return {
        valor: atual,
        porcentagem: Math.abs(porcentagem),
        isPositive: porcentagem >= 0,
      };
    };

    const novosPetsCount = novosPets[0]?.count || 0;
    const novosPetsAnteriorCount = novosPetsAnterior[0]?.count || 0;
    const novasClinicasCount = novasClinicas[0]?.count || 0;
    const novasClinicasAnteriorCount = novasClinicasAnterior[0]?.count || 0;

    // TODO: Implementar consultas quando a tabela existir
    const totalConsultasCount = 0;
    const totalConsultasAnteriorCount = 0;

    const novosPetsStats = calcularVariacao(
      novosPetsCount,
      novosPetsAnteriorCount
    );
    const novasClinicasStats = calcularVariacao(
      novasClinicasCount,
      novasClinicasAnteriorCount
    );
    const totalConsultasStats = calcularVariacao(
      totalConsultasCount,
      totalConsultasAnteriorCount
    );

    return NextResponse.json({
      faturamento: 0, // Deixar R$ 0,00 como solicitado
      novosPets: novosPetsStats,
      novasClinicas: novasClinicasStats,
      totalConsultas: totalConsultasStats,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas do dashboard:", error);
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 }
    );
  }
}

