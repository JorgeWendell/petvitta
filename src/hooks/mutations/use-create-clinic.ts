import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createClinicAction } from "@/actions/create-clinic";
import { clinicsQueryKey } from "@/hooks/queries/use-clinics";

export const createClinicMutationKey = () => ["create-clinic"] as const;

export function useCreateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createClinicMutationKey(),
    mutationFn: async (data: {
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
      const result = await createClinicAction(data);

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

      if (result.data.success || result.data.clinic) {
        return result.data;
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinics"] });
      toast.success("Clínica criada com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar clínica");
    },
  });
}

