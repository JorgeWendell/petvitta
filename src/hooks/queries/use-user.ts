import { useQuery } from "@tanstack/react-query";

import { getUserAction } from "@/actions/get-user";

export const userQueryKey = (id: string) => ["user", id] as const;

export function useUser(id: string) {
  return useQuery({
    queryKey: userQueryKey(id),
    queryFn: async () => {
      const result = await getUserAction({ id });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data?.user;
    },
    enabled: !!id,
  });
}

