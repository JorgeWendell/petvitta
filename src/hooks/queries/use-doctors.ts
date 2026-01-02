import { useQuery } from "@tanstack/react-query";

import { listDoctorsAction } from "@/actions/list-doctors";

export const doctorsQueryKey = (params?: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) => ["doctors", params] as const;

export function useDoctors(params: {
  clinicId: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: doctorsQueryKey(params),
    queryFn: async () => {
      const result = await listDoctorsAction({
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

