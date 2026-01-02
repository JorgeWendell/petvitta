"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useMonthlyBillingReport } from "@/hooks/queries/use-monthly-billing-report";

export function MonthlyBillingReport() {
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [year, setYear] = useState<number>(currentDate.getFullYear());

  const { data, isLoading, error, isError, refetch } = useMonthlyBillingReport({
    month,
    year,
  });

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[monthNumber - 1] || "";
  };

  const handleGenerate = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <FieldGroup>
            <Field>
              <FieldContent>
                <Input
                  type="number"
                  placeholder="Mês"
                  min={1}
                  max={12}
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value) || 1)}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Field>
              <FieldContent>
                <Input
                  type="number"
                  placeholder="Ano"
                  min={2020}
                  max={2100}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                />
              </FieldContent>
            </Field>
          </FieldGroup>
          <Button onClick={handleGenerate}>Gerar Relatório</Button>
        </div>
      </div>

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              {error?.message || "Erro ao carregar relatório"}
            </p>
          </div>
        </div>
      )}

      {data?.data && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Período</p>
              <p className="text-lg font-semibold">
                {getMonthName(month)}/{year}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Assinaturas</p>
              <p className="text-lg font-semibold">{data.data.totalSubscriptions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-lg font-semibold">
                {formatPrice(data.data.totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Pet</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plano</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Data Início</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Data Criação</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-32" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              ) : !data?.data || !data.data.subscriptions || data.data.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>Nenhuma assinatura encontrada para o período selecionado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.data.subscriptions.map((item, index) => (
                  <tr
                    key={item.subscriptionId || index}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium">{item.petName}</td>
                    <td className="px-4 py-3 text-sm">{item.planName}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(item.planPrice || "0")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(item.subscriptionStartDate)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(item.subscriptionCreatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

