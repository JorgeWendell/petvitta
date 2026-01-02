import { useQuery } from "@tanstack/react-query";

import { usageByPetReportAction } from "@/actions/reports/usage-by-pet";

export const usageByPetReportQueryKey = (params?: {
  month?: number;
  year?: number;
}) => ["reports", "usage-by-pet", params] as const;

export function useUsageByPetReport(params?: { month?: number; year?: number }) {
  return useQuery({
    queryKey: usageByPetReportQueryKey(params),
    queryFn: async () => {
      const result = await usageByPetReportAction({
        month: params?.month,
        year: params?.year,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data;
    },
    enabled: true,
  });
}

