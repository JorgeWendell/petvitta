"use client";

import { AlertCircle, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useUsageByPetReport } from "@/hooks/queries/use-usage-by-pet-report";

export function UsageByPetReport() {
  const currentDate = new Date();
  const [month, setMonth] = useState<number | undefined>(
    currentDate.getMonth() + 1
  );
  const [year, setYear] = useState<number | undefined>(
    currentDate.getFullYear()
  );

  const { data, isLoading, error, isError, refetch } = useUsageByPetReport({
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
                  value={month || ""}
                  onChange={(e) =>
                    setMonth(e.target.value ? parseInt(e.target.value) : undefined)
                  }
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
                  value={year || ""}
                  onChange={(e) =>
                    setYear(e.target.value ? parseInt(e.target.value) : undefined)
                  }
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

      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Pet</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Tutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">E-mail Tutor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Plano</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Valor</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Data Início</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
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
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  </tr>
                ))
              ) : !data?.data || data.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-8 w-8" />
                      <p>Nenhum dado encontrado para o período selecionado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.data.map((item, index) => (
                  <tr
                    key={item.subscriptionId || index}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <td className="px-4 py-3 font-medium">{item.petName}</td>
                    <td className="px-4 py-3 text-sm">{item.tutorName}</td>
                    <td className="px-4 py-3 text-sm">{item.tutorEmail}</td>
                    <td className="px-4 py-3 text-sm">{item.planName}</td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(item.planPrice || "0")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(item.subscriptionStartDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                        {item.subscriptionStatus}
                      </span>
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

