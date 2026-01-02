import { useQuery } from "@tanstack/react-query";

import { getCurrentUserClinicAction } from "@/actions/get-current-user-clinic";

export const currentUserClinicQueryKey = () => ["current-user-clinic"] as const;

export function useCurrentUserClinic() {
  return useQuery({
    queryKey: currentUserClinicQueryKey(),
    queryFn: async () => {
      const result = await getCurrentUserClinicAction({});

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
  });
}

