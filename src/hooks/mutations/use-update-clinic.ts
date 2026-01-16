import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateClinicAction } from "@/actions/update-clinic";
import { clinicsQueryKey } from "@/hooks/queries/use-clinics";
import { clinicQueryKey } from "@/hooks/queries/use-clinic";

export const updateClinicMutationKey = () => ["update-clinic"] as const;

export function useUpdateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateClinicMutationKey(),
    mutationFn: async (data: {
      id: string;
      name: string;
      cnpj?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      userId: string;
      status: "ATIVO" | "INATIVO";
    }) => {
      const result = await updateClinicAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao atualizar clínica: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success && result.data.clinic) {
        return result.data;
      }

      throw new Error("Erro ao atualizar clínica: resposta inesperada");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      queryClient.invalidateQueries({ queryKey: clinicQueryKey(variables.id) });
      toast.success("Clínica atualizada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar clínica");
    },
  });
}

