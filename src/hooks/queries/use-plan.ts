import { useQuery } from "@tanstack/react-query";

import { getPlanAction } from "@/actions/get-plan";

export const planQueryKey = (id: string) => ["plan", id] as const;

export function usePlan(id: string) {
  return useQuery({
    queryKey: planQueryKey(id),
    queryFn: async () => {
      const result = await getPlanAction({ id });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data?.plan;
    },
    enabled: !!id,
  });
}

