import { useQuery } from "@tanstack/react-query";

import { listUsersAction } from "@/actions/list-users";

export const usersQueryKey = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "CLINIC" | "TUTOR";
}) => ["users", params] as const;

export function useUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: "ADMIN" | "CLINIC" | "TUTOR";
}) {
  return useQuery({
    queryKey: usersQueryKey(params),
    queryFn: async () => {
      const result = await listUsersAction({
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        search: params?.search,
        role: params?.role,
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

