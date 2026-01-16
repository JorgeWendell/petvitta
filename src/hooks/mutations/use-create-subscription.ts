import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createSubscriptionAction } from "@/actions/create-subscription";
import { subscriptionsQueryKey } from "@/hooks/queries/use-subscriptions";

export const createSubscriptionMutationKey = () => ["create-subscription"] as const;

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createSubscriptionMutationKey(),
    mutationFn: async (data: {
      petId: string;
      planId: string;
      status: "ATIVA" | "CANCELADA" | "SUSPENSA" | "EXPIRADA";
      startDate: string;
      endDate?: string;
      nextBillingDate?: string;
      asaasSubscriptionId?: string;
    }) => {
      const result = await createSubscriptionAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        return { success: true };
      }

      if (result.data.success || result.data.subscription) {
        return result.data;
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Assinatura criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar assinatura");
    },
  });
}

