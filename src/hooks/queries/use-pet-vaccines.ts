import { useQuery } from "@tanstack/react-query";

import { listPetVaccinesAction } from "@/actions/list-pet-vaccines";

export const petVaccinesQueryKey = (petId: string, page: number, limit: number) =>
  ["pet-vaccines", petId, page, limit] as const;

export function usePetVaccines(petId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: petVaccinesQueryKey(petId, page, limit),
    queryFn: async () => {
      const result = await listPetVaccinesAction({ petId, page, limit });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data;
    },
    enabled: !!petId,
  });
}

