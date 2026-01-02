import { useQuery } from "@tanstack/react-query";

export const dashboardStatsQueryKey = (params: {
  month: number;
  year: number;
}) => ["dashboard-stats", params] as const;

export interface DashboardStats {
  faturamento: number;
  novosPets: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
  novasClinicas: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
  totalConsultas: {
    valor: number;
    porcentagem: number;
    isPositive: boolean;
  };
}

export function useDashboardStats(params: { month: number; year: number }) {
  return useQuery({
    queryKey: dashboardStatsQueryKey(params),
    queryFn: async () => {
      const response = await fetch(
        `/api/dashboard/stats?month=${params.month}&year=${params.year}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar estatísticas");
      }

      const data = await response.json();
      return data as DashboardStats;
    },
    enabled: !!params.month && !!params.year,
  });
}

