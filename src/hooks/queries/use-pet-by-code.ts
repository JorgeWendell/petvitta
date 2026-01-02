import { useQuery } from "@tanstack/react-query";

import { getPetByCodeAction } from "@/actions/get-pet-by-code";

export const petByCodeQueryKey = (codigo: string) => ["pet-by-code", codigo] as const;

export function usePetByCode(codigo: string) {
  return useQuery({
    queryKey: petByCodeQueryKey(codigo),
    queryFn: async () => {
      const result = await getPetByCodeAction({ codigo });

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
    enabled: !!codigo,
  });
}

