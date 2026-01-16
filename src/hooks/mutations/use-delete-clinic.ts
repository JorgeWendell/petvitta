import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteClinicAction } from "@/actions/delete-clinic";
import { clinicsQueryKey } from "@/hooks/queries/use-clinics";

export const deleteClinicMutationKey = () => ["delete-clinic"] as const;

export function useDeleteClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteClinicMutationKey(),
    mutationFn: async (data: { id: string }) => {
      const result = await deleteClinicAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao excluir clínica: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success) {
        return result.data;
      }

      throw new Error("Erro ao excluir clínica: resposta inesperada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clínica excluída com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir clínica");
    },
  });
}

