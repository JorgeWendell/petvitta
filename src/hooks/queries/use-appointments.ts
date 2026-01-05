import { useQuery } from "@tanstack/react-query";

import { listAppointmentsAction } from "@/actions/list-appointments";

export const appointmentsQueryKey = (params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) => ["appointments", params] as const;

export function useAppointments(params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: appointmentsQueryKey(params),
    queryFn: async () => {
      const result = await listAppointmentsAction({
        clinicId: params.clinicId,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search,
      });

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
    enabled: !!params.clinicId,
  });
}

