import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateUserAction } from "@/actions/update-user";
import { usersQueryKey } from "@/hooks/queries/use-users";
import { userQueryKey } from "@/hooks/queries/use-user";

export const updateUserMutationKey = () => ["update-user"] as const;

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateUserMutationKey(),
    mutationFn: async (data: {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "CLINIC" | "TUTOR";
      isActive: boolean;
    }) => {
      const result = await updateUserAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        const errorMessage = typeof errors[0] === 'string' ? errors[0] : "Erro de validação";
        throw new Error(errorMessage);
      }

      if (!result?.data) {
        throw new Error("Erro ao atualizar usuário: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success && result.data.user) {
        return result.data;
      }

      throw new Error("Erro ao atualizar usuário: resposta inesperada");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: userQueryKey(variables.id) });
      toast.success("Usuário atualizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar usuário");
    },
  });
}

