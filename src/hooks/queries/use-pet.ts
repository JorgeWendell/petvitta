import { useQuery } from "@tanstack/react-query";

import { getPetAction } from "@/actions/get-pet";

export const petQueryKey = (id: string) => ["pet", id] as const;

export function usePet(id: string) {
  return useQuery({
    queryKey: petQueryKey(id),
    queryFn: async () => {
      const result = await getPetAction({ id });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data?.pet;
    },
    enabled: !!id,
  });
}

