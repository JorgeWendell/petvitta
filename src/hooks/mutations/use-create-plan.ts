import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createPlanAction } from "@/actions/create-plan";
import { plansQueryKey } from "@/hooks/queries/use-plans";

export const createPlanMutationKey = () => ["create-plan"] as const;

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createPlanMutationKey(),
    mutationFn: async (data: {
      name: string;
      description?: string;
      price: string;
      carePeriodDays: number;
      status: "ATIVO" | "INATIVO";
    }) => {
      const result = await createPlanAction(data);

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

      if (result.data.success || result.data.plan) {
        return result.data;
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Plano criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar plano");
    },
  });
}

