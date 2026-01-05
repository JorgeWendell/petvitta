import { useQuery } from "@tanstack/react-query";

import { listMedicalRecordsAction } from "@/actions/list-medical-records";

export const medicalRecordsQueryKey = (petId: string) =>
  ["medical-records", petId] as const;

export function useMedicalRecords(petId: string) {
  return useQuery({
    queryKey: medicalRecordsQueryKey(petId),
    queryFn: async () => {
      const result = await listMedicalRecordsAction({ petId });

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

