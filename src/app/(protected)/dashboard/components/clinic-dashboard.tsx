"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinicStats } from "@/hooks/queries/use-clinic-stats";

type TimeRange = "3months" | "30days" | "7days";

interface ClinicDashboardProps {
  selectedMonth: number;
  selectedYear: number;
}

const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function ClinicDashboard({
  selectedMonth,
  selectedYear,
}: ClinicDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3months");

  const { data: stats, isLoading } = useClinicStats({
    month: selectedMonth,
    year: selectedYear,
  });

  // Dados filtrados baseado no período selecionado
  const getFilteredData = () => {
    if (!stats?.faturamentoHistorico) return [];

    const historicalData = stats.faturamentoHistorico;

    switch (timeRange) {
      case "7days":
        return historicalData.slice(-7);
      case "30days":
        return historicalData.slice(-30);
      default:
        return historicalData;
    }
  };

  const filteredData = getFilteredData();

  const getRangeLabel = () => {
    switch (timeRange) {
      case "7days":
        return "últimos 7 dias";
      case "30days":
        return "últimos 30 dias";
      default:
        return "últimos 3 meses";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Erro ao carregar estatísticas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(stats.consultas.valor)}
            </div>
            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
              {stats.consultas.isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  stats.consultas.isPositive ? "text-green-600" : "text-red-600"
                }
              >
                {stats.consultas.isPositive ? "+" : "-"}
                {stats.consultas.porcentagem.toFixed(1)}%
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {stats.consultas.isPositive
                ? "Aumento em relação ao mês anterior"
                : "Queda em relação ao mês anterior"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(stats.agendamentos.valor)}
            </div>
            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
              {stats.agendamentos.isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  stats.agendamentos.isPositive
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {stats.agendamentos.isPositive ? "+" : "-"}
                {stats.agendamentos.porcentagem.toFixed(1)}%
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {stats.agendamentos.isPositive
                ? "Aumento em relação ao mês anterior"
                : "Queda em relação ao mês anterior"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.faturamento.valor / 100)}
            </div>
            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
              {stats.faturamento.isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  stats.faturamento.isPositive
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {stats.faturamento.isPositive ? "+" : "-"}
                {stats.faturamento.porcentagem.toFixed(1)}%
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {stats.faturamento.isPositive
                ? "Aumento em relação ao mês anterior"
                : "Queda em relação ao mês anterior"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacinas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(stats.vacinas.valor)}
            </div>
            <div className="text-muted-foreground flex items-center space-x-1 text-xs">
              {stats.vacinas.isPositive ? (
                <ArrowUp className="h-3 w-3 text-green-600" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  stats.vacinas.isPositive ? "text-green-600" : "text-red-600"
                }
              >
                {stats.vacinas.isPositive ? "+" : "-"}
                {stats.vacinas.porcentagem.toFixed(1)}%
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {stats.vacinas.isPositive
                ? "Aumento em relação ao mês anterior"
                : "Queda em relação ao mês anterior"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Faturamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Faturamento</CardTitle>
              <CardDescription>
                Faturamento dos {getRangeLabel()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === "3months" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("3months")}
              >
                Últimos 3 meses
              </Button>
              <Button
                variant={timeRange === "30days" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("30days")}
              >
                Últimos 30 dias
              </Button>
              <Button
                variant={timeRange === "7days" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange("7days")}
              >
                Últimos 7 dias
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-muted-foreground flex h-[300px] items-center justify-center">
              Nenhum dado disponível para o período selecionado
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                data={filteredData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="fillFaturamento"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--color-faturamento)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-faturamento)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(value)
                  }
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background rounded-lg border p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">
                                {payload[0].payload.date}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-muted-foreground">
                                Faturamento:
                              </span>
                              <span className="font-medium">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(payload[0].value as number)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  stroke="var(--color-faturamento)"
                  fill="url(#fillFaturamento)"
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
