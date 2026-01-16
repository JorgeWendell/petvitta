import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deletePetAction } from "@/actions/delete-pet";
import { petsQueryKey } from "@/hooks/queries/use-pets";

export const deletePetMutationKey = () => ["delete-pet"] as const;

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deletePetMutationKey(),
    mutationFn: async (data: { id: string }) => {
      const result = await deletePetAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao excluir pet: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success) {
        return result.data;
      }

      throw new Error("Erro ao excluir pet: resposta inesperada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast.success("Pet excluído com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir pet");
    },
  });
}

