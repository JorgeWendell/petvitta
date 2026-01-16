import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteDoctorAction } from "@/actions/delete-doctor";
import { doctorsQueryKey } from "@/hooks/queries/use-doctors";

export const deleteDoctorMutationKey = () => ["delete-doctor"] as const;

export function useDeleteDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteDoctorMutationKey(),
    mutationFn: async (data: { id: string; clinicId: string }) => {
      const result = await deleteDoctorAction({ id: data.id });

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

      if (result.data.success) {
        return result.data;
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: doctorsQueryKey({ clinicId: variables.clinicId }),
      });
      toast.success("Veterinário deletado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao deletar veterinário");
    },
  });
}

