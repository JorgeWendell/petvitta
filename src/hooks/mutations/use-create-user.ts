import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createUserAction } from "@/actions/create-user";
import { usersQueryKey } from "@/hooks/queries/use-users";

export const createUserMutationKey = () => ["create-user"] as const;

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createUserMutationKey(),
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
      role: "ADMIN" | "CLINIC" | "TUTOR";
      isActive: boolean;
    }) => {
      const result = await createUserAction(data);

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

      if (result.data.success || result.data.user) {
        return result.data;
      }
      
      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar usuário");
    },
  });
}

