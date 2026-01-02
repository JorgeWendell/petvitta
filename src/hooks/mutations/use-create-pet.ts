import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createPetAction } from "@/actions/create-pet";
import { petsQueryKey } from "@/hooks/queries/use-pets";

export const createPetMutationKey = () => ["create-pet"] as const;

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createPetMutationKey(),
    mutationFn: async (data: {
      codigo?: string;
      name: string;
      species: "CÃO" | "GATO" | "PASSARO" | "COELHO" | "HAMSTER" | "OUTRO";
      breed?: string;
      dateOfBirth?: string;
      gender?: "MACHO" | "FÊMEA";
      status: "ATIVO" | "SUSPENSO";
      tutorId: string;
      planId?: string;
    }) => {
      const result = await createPetAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        throw new Error(errors[0] || "Erro de validação");
      }

      if (!result?.data) {
        return { success: true };
      }

      if (result.data.success || result.data.pet) {
        return result.data;
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      toast.success("Pet criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar pet");
    },
  });
}

