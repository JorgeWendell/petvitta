import { useQuery } from "@tanstack/react-query";

import { listPlansAction } from "@/actions/list-plans";

export const plansQueryKey = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ATIVO" | "INATIVO";
}) => ["plans", params] as const;

export function usePlans(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ATIVO" | "INATIVO";
}) {
  return useQuery({
    queryKey: plansQueryKey(params),
    queryFn: async () => {
      const result = await listPlansAction({
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search,
        status: params?.status,
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

