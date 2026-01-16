import { useQuery } from "@tanstack/react-query";

import { listPastAppointmentsAction } from "@/actions/list-past-appointments";

export const pastAppointmentsQueryKey = (params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) => ["past-appointments", params] as const;

export function usePastAppointments(params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: pastAppointmentsQueryKey(params),
    queryFn: async () => {
      const result = await listPastAppointmentsAction({
        clinicId: params.clinicId,
        page: params.page || 1,
        limit: params.limit || 10,
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

