import { useQuery } from "@tanstack/react-query";

import { listPetsAction } from "@/actions/list-pets";

export const petsQueryKey = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ATIVO" | "SUSPENSO";
  tutorId?: string;
}) => ["pets", params] as const;

export function usePets(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ATIVO" | "SUSPENSO";
  tutorId?: string;
}) {
  return useQuery({
    queryKey: petsQueryKey(params),
    queryFn: async () => {
      const result = await listPetsAction({
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search,
        status: params?.status,
        tutorId: params?.tutorId,
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

