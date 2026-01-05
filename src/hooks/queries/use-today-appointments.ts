import { useQuery } from "@tanstack/react-query";

import { listTodayAppointmentsAction } from "@/actions/list-today-appointments";

export const todayAppointmentsQueryKey = (params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) => ["today-appointments", params] as const;

export function useTodayAppointments(params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: todayAppointmentsQueryKey(params),
    queryFn: async () => {
      const result = await listTodayAppointmentsAction({
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

