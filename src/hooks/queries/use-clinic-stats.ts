import { useQuery } from "@tanstack/react-query";

export const clinicStatsQueryKey = (params: {
  month: number;
  year: number;
}) => ["clinic-stats", params] as const;

export interface ClinicStats {
  consultas: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
  agendamentos: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
  faturamento: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
  vacinas: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
  faturamentoHistorico: Array<{
    date: string;
    faturamento: number;
  }>;
}

export function useClinicStats(params: { month: number; year: number }) {
  return useQuery({
    queryKey: clinicStatsQueryKey(params),
    queryFn: async () => {
      const response = await fetch(
        `/api/clinic/stats?month=${params.month}&year=${params.year}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar estatísticas da clínica");
      }

      const data = await response.json();
      return data as ClinicStats;
    },
    enabled: !!params.month && !!params.year,
  });
}

