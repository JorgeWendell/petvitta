import { useQuery } from "@tanstack/react-query";

import { usageByClinicReportAction } from "@/actions/reports/usage-by-clinic";

export const usageByClinicReportQueryKey = (params?: {
  month?: number;
  year?: number;
}) => ["reports", "usage-by-clinic", params] as const;

export function useUsageByClinicReport(params?: { month?: number; year?: number }) {
  return useQuery({
    queryKey: usageByClinicReportQueryKey(params),
    queryFn: async () => {
      const result = await usageByClinicReportAction({
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

