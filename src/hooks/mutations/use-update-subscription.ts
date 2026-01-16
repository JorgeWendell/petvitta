import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateSubscriptionAction } from "@/actions/update-subscription";
import { subscriptionsQueryKey } from "@/hooks/queries/use-subscriptions";
import { subscriptionQueryKey } from "@/hooks/queries/use-subscription";

export const updateSubscriptionMutationKey = () => ["update-subscription"] as const;

export function useUpdateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateSubscriptionMutationKey(),
    mutationFn: async (data: {
      id: string;
      petId: string;
      planId: string;
      status: "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA";
      startDate: string;
      endDate?: string;
      nextBillingDate?: string;
      asaasSubscriptionId?: string;
    }) => {
      const result = await updateSubscriptionAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao atualizar assinatura: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success && result.data.subscription) {
        return result.data;
      }

      throw new Error("Erro ao atualizar assinatura: resposta inesperada");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: subscriptionQueryKey(variables.id) });
      toast.success("Assinatura atualizada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar assinatura");
    },
  });
}

