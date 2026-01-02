import { useQuery } from "@tanstack/react-query";

import { listSubscriptionsAction } from "@/actions/list-subscriptions";

export const subscriptionsQueryKey = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA";
  petId?: string;
  planId?: string;
}) => ["subscriptions", params] as const;

export function useSubscriptions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA";
  petId?: string;
  planId?: string;
}) {
  return useQuery({
    queryKey: subscriptionsQueryKey(params),
    queryFn: async () => {
      const result = await listSubscriptionsAction({
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search,
        status: params?.status,
        petId: params?.petId,
        planId: params?.planId,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      return result.data;
    },
    enabled: true,
  });
}

