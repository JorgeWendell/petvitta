import { useQuery } from "@tanstack/react-query";

import { monthlyBillingReportAction } from "@/actions/reports/monthly-billing";

export const monthlyBillingReportQueryKey = (params: {
  month: number;
  year: number;
}) => ["reports", "monthly-billing", params] as const;

export function useMonthlyBillingReport(params: { month: number; year: number }) {
  return useQuery({
    queryKey: monthlyBillingReportQueryKey(params),
    queryFn: async () => {
      const result = await monthlyBillingReportAction({
        month: params.month,
        year: params.year,
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

