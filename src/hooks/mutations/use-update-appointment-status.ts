import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateAppointmentStatusAction } from "@/actions/update-appointment-status";

export const updateAppointmentStatusMutationKey = () =>
  ["update-appointment-status"] as const;

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: updateAppointmentStatusMutationKey(),
    mutationFn: async (data: {
      appointmentId: string;
      status: "AGENDADO" | "CONCLUIDO";
    }) => {
      const result = await updateAppointmentStatusAction(data);

      if (result?.serverError) {
        throw new Error(result.serverError);
      }

      if (result?.validationErrors) {
        const errors = Object.values(result.validationErrors).flat();
        throw new Error(errors[0] || "Erro de validação");
      }

      if (!result?.data) {
        throw new Error("Erro ao atualizar status: resposta inválida");
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      if (result.data.success) {
        return result.data;
      }

      throw new Error("Erro ao atualizar status: resposta inesperada");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return (
            query.queryKey[0] === "today-appointments" ||
            query.queryKey[0] === "appointments"
          );
        },
      });
      toast.success("Atendimento finalizado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });
}

