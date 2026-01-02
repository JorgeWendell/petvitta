import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deletePlanAction } from "@/actions/delete-plan";
import { plansQueryKey } from "@/hooks/queries/use-plans";

export const deletePlanMutationKey = () => ["delete-plan"] as const;

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deletePlanMutationKey(),
    mutationFn: async (data: { id: string }) => {
      const result = await deletePlanAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        throw new Error(errors[0] || "Erro de validação");
      }

      if (!result?.data) {
        throw new Error("Erro ao excluir plano: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success) {
        return result.data;
      }

      throw new Error("Erro ao excluir plano: resposta inesperada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano excluído com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir plano");
    },
  });
}

