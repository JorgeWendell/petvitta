import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteAppointmentAction } from "@/actions/delete-appointment";
import { appointmentsQueryKey } from "@/hooks/queries/use-appointments";

export const deleteAppointmentMutationKey = () => ["delete-appointment"] as const;

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: deleteAppointmentMutationKey(),
    mutationFn: async (data: { id: string; clinicId: string }) => {
      const result = await deleteAppointmentAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        throw new Error(errors[0] || "Erro de validação");
      }

      if (result?.data?.error) {
        throw new Error(result.data.error);
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento cancelado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao cancelar agendamento");
    },
  });
}

