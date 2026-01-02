"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

// Dados mockados - substituir por dados reais da API
const chartData = [
  { date: "Apr 1", visits: 120, previous: 100 },
  { date: "Apr 7", visits: 150, previous: 130 },
  { date: "Apr 13", visits: 140, previous: 110 },
  { date: "Apr 19", visits: 180, previous: 150 },
  { date: "Apr 26", visits: 160, previous: 140 },
  { date: "May 2", visits: 200, previous: 170 },
  { date: "May 8", visits: 220, previous: 190 },
  { date: "May 14", visits: 210, previous: 180 },
  { date: "May 21", visits: 250, previous: 210 },
  { date: "May 28", visits: 230, previous: 200 },
  { date: "Jun 3", visits: 270, previous: 230 },
  { date: "Jun 9", visits: 290, previous: 250 },
  { date: "Jun 15", visits: 280, previous: 240 },
  { date: "Jun 21", visits: 310, previous: 270 },
  { date: "Jun 29", visits: 330, previous: 290 },
];

const chartConfig = {
  visits: {
    label: "Visitas",
    color: "hsl(var(--chart-1))",
  },
  previous: {
    label: "Período Anterior",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type TimeRange = "3months" | "30days" | "7days";

interface ClinicDashboardProps {
  selectedMonth: number;
  selectedYear: number;
}

export function ClinicDashboard({ selectedMonth, selectedYear }: ClinicDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("3months");

  // Dados filtrados baseado no período selecionado
  const getFilteredData = () => {
    switch (timeRange) {
      case "7days":
        return chartData.slice(-7);
      case "30days":
        return chartData.slice(-10);
      default:
        return chartData;
    }
  };

  const filteredData = getFilteredData();

  // Função para calcular os KPIs baseado no mês/ano selecionado
  const getKPIData = useMemo(() => {
    // TODO: Substituir por dados reais da API baseado em selectedMonth e selectedYear
    const baseConsultas = 342;
    const basePacientes = 128;
    const baseFaturamento = 45680;
    const baseOcupacao = 78;

    // Exemplo de variação baseada no mês (pode ser substituído por dados reais)
    const currentMonth = new Date().getMonth() + 1;
    const monthMultiplier = selectedMonth / currentMonth;
    
    return {
      consultas: Math.round(baseConsultas * monthMultiplier),
      pacientes: Math.round(basePacientes * monthMultiplier),
      faturamento: Math.round(baseFaturamento * monthMultiplier),
      ocupacao: Math.round(baseOcupacao * (monthMultiplier > 1 ? 1.05 : 0.95)),
    };
  }, [selectedMonth, selectedYear]);

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

  return (
    <div className="space-y-6">
      {/* Cards de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(getKPIData.consultas)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+15.2%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aumento em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR").format(getKPIData.pacientes)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+8%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Crescimento constante
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
              }).format(getKPIData.faturamento)}
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+22.3%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Meta do mês atingida
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getKPIData.ocupacao}%</div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <ArrowDown className="h-3 w-3 text-orange-600" />
              <span className="text-orange-600">-3%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ligeira queda este período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Visitas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Total de Visitas</CardTitle>
              <CardDescription>Total dos {getRangeLabel()}</CardDescription>
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
                <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-visits)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-visits)"
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
                tickFormatter={(value) => `${value}`}
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
                dataKey="visits"
                stroke="var(--color-visits)"
                fill="url(#fillVisits)"
                stackId="2"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

