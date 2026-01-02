"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboardStats } from "@/hooks/queries/use-dashboard-stats";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  faturamento: {
    label: "Faturamento",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Período Anterior",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

interface AdminDashboardProps {
  selectedMonth: number;
  selectedYear: number;
}

export function AdminDashboard({
  selectedMonth,
  selectedYear,
}: AdminDashboardProps) {
  // Gerar dados de todos os dias do mês/ano selecionado
  const getFilteredData = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Sempre começar do dia 1 do mês selecionado
    const startDay = 1;

    // Se o mês selecionado for o mês atual, usar o dia de hoje como fim
    // Senão, usar o último dia do mês selecionado
    let endDay: number;
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      endDay = currentDay;
    } else {
      // Último dia do mês selecionado
      // Usando new Date(ano, mês, 0) retorna o último dia do mês anterior
      // Então new Date(selectedYear, selectedMonth, 0) retorna o último dia de selectedMonth
      const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
      endDay = lastDayOfMonth.getDate();
    }

    const data = [];

    // Gerar todos os dias do mês
    for (let day = startDay; day <= endDay; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dateStr = date.toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
      });

      data.push({
        date: dateStr,
        faturamento: 0, // TODO: Substituir por dados reais da API
        previous: 0, // TODO: Substituir por dados reais da API
      });
    }

    return data;
  }, [selectedMonth, selectedYear]);

  // Buscar dados reais da API
  const { data: statsData, isLoading: isLoadingStats } = useDashboardStats({
    month: selectedMonth,
    year: selectedYear,
  });

  if (isLoadingStats) {
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

  const stats = statsData || {
    faturamento: 0,
    novosPets: { valor: 0, porcentagem: 0, isPositive: true },
    novasClinicas: { valor: 0, porcentagem: 0, isPositive: true },
    totalConsultas: { valor: 0, porcentagem: 0, isPositive: true },
  };

  return (
    <div className="space-y-6">
      {/* Cards de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats.faturamento)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(stats.novosPets.valor)}
            </div>
            {stats.novosPets.porcentagem > 0 && (
              <div className="text-muted-foreground mt-1 flex items-center space-x-1 text-xs">
                {stats.novosPets.isPositive ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{stats.novosPets.porcentagem.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      -{stats.novosPets.porcentagem.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-muted-foreground mt-1 text-xs">
              Em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Novas Clínicas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(stats.novasClinicas.valor)}
            </div>
            {stats.novasClinicas.porcentagem > 0 && (
              <div className="text-muted-foreground mt-1 flex items-center space-x-1 text-xs">
                {stats.novasClinicas.isPositive ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{stats.novasClinicas.porcentagem.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      -{stats.novasClinicas.porcentagem.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-muted-foreground mt-1 text-xs">
              Em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Consultas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(
                stats.totalConsultas.valor,
              )}
            </div>
            {stats.totalConsultas.porcentagem > 0 && (
              <div className="text-muted-foreground mt-1 flex items-center space-x-1 text-xs">
                {stats.totalConsultas.isPositive ? (
                  <>
                    <ArrowUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">
                      +{stats.totalConsultas.porcentagem.toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">
                      -{stats.totalConsultas.porcentagem.toFixed(1)}%
                    </span>
                  </>
                )}
              </div>
            )}
            <p className="text-muted-foreground mt-1 text-xs">
              Em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Faturamento */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Faturamento</CardTitle>
            <CardDescription>
              {new Date(selectedYear, selectedMonth - 1, 1).toLocaleDateString(
                "pt-BR",
                { month: "long", year: "numeric" },
              )}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <AreaChart
              data={getFilteredData}
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
                <linearGradient id="fillPrevious" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-previous)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-previous)"
                    stopOpacity={0.05}
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
                width={80}
                tickFormatter={(value) =>
                  new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    maximumFractionDigits: 0,
                  }).format(value)
                }
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="previous"
                stroke="var(--color-previous)"
                fill="url(#fillPrevious)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="var(--color-faturamento)"
                fill="url(#fillFaturamento)"
                stackId="2"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
