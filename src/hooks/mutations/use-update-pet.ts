import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updatePetAction } from "@/actions/update-pet";
import { petsQueryKey } from "@/hooks/queries/use-pets";
import { petQueryKey } from "@/hooks/queries/use-pet";

export const updatePetMutationKey = () => ["update-pet"] as const;

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updatePetMutationKey(),
    mutationFn: async (data: {
      id: string;
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
      const result = await updatePetAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        throw new Error(errors[0] || "Erro de validação");
      }

      if (!result?.data) {
        throw new Error("Erro ao atualizar pet: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success && result.data.pet) {
        return result.data;
      }

      throw new Error("Erro ao atualizar pet: resposta inesperada");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      queryClient.invalidateQueries({ queryKey: petQueryKey(variables.id) });
      toast.success("Pet atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar pet");
    },
  });
}

