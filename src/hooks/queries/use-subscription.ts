import { useQuery } from "@tanstack/react-query";

import { getSubscriptionAction } from "@/actions/get-subscription";

export const subscriptionQueryKey = (id: string) => ["subscription", id] as const;

export function useSubscription(id: string) {
  return useQuery({
    queryKey: subscriptionQueryKey(id),
    queryFn: async () => {
      const result = await getSubscriptionAction({ id });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data?.subscription;
    },
    enabled: !!id,
  });
}

