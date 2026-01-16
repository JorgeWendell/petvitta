import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteSubscriptionAction } from "@/actions/delete-subscription";
import { subscriptionsQueryKey } from "@/hooks/queries/use-subscriptions";

export const deleteSubscriptionMutationKey = () => ["delete-subscription"] as const;

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteSubscriptionMutationKey(),
    mutationFn: async (data: { id: string }) => {
      const result = await deleteSubscriptionAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao excluir assinatura: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success) {
        return result.data;
      }

      throw new Error("Erro ao excluir assinatura: resposta inesperada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Assinatura excluída com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir assinatura");
    },
  });
}

