import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { upsertDoctorAction } from "@/actions/upsert-doctor";
import { doctorsQueryKey } from "@/hooks/queries/use-doctors";

export const upsertDoctorMutationKey = () => ["upsert-doctor"] as const;

export function useUpsertDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: upsertDoctorMutationKey(),
    mutationFn: async (data: {
      id?: string;
      clinicId: string;
      name: string;
      email: string;
      availableFromWeekDay: number;
      availableToWeekDay: number;
      availableFromTime: string;
      availableToTime: string;
      avatarImageUrl?: string;
      appointmentPriceInCents: number;
    }) => {
      const result = await upsertDoctorAction(data);

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

      if (result.data.success || result.data.doctor) {
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
      toast.success(
        variables.id
          ? "Veterinário atualizado com sucesso"
          : "Veterinário criado com sucesso"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar veterinário");
    },
  });
}

