import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteUserAction } from "@/actions/delete-user";
import { usersQueryKey } from "@/hooks/queries/use-users";

export const deleteUserMutationKey = () => ["delete-user"] as const;

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteUserMutationKey(),
    mutationFn: async (data: { id: string }) => {
      const result = await deleteUserAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        throw new Error(errors[0] || "Erro de validação");
      }

      if (!result?.data) {
        throw new Error("Erro ao excluir usuário: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success) {
        return result.data;
      }

      throw new Error("Erro ao excluir usuário: resposta inesperada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário excluído com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir usuário");
    },
  });
}

