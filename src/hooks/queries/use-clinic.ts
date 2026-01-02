import { useQuery } from "@tanstack/react-query";

import { getClinicAction } from "@/actions/get-clinic";

export const clinicQueryKey = (id: string) => ["clinic", id] as const;

export function useClinic(id: string) {
  return useQuery({
    queryKey: clinicQueryKey(id),
    queryFn: async () => {
      const result = await getClinicAction({ id });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        throw new Error("Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data?.clinic;
    },
    enabled: !!id,
  });
}

