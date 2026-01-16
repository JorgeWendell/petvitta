import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updatePlanAction } from "@/actions/update-plan";
import { plansQueryKey } from "@/hooks/queries/use-plans";
import { planQueryKey } from "@/hooks/queries/use-plan";

export const updatePlanMutationKey = () => ["update-plan"] as const;

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updatePlanMutationKey(),
    mutationFn: async (data: {
      id: string;
      name: string;
      description?: string;
      price: string;
      carePeriodDays: number;
      status: "ATIVO" | "INATIVO";
    }) => {
      const result = await updatePlanAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao atualizar plano: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success && result.data.plan) {
        return result.data;
      }

      throw new Error("Erro ao atualizar plano: resposta inesperada");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: planQueryKey(variables.id) });
      toast.success("Plano atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar plano");
    },
  });
}

