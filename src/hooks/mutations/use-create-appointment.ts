import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createAppointmentAction } from "@/actions/create-appointment";

export const createAppointmentMutationKey = () => ["create-appointment"] as const;

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: createAppointmentMutationKey(),
    mutationFn: async (data: {
      petCodigo: string;
      doctorId: string;
      appointmentDate: string;
      appointmentTime: string;
      priceInCents: number;
    }) => {
      const result = await createAppointmentAction(data);

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

      if (result.data.success || result.data.appointment) {
        return result.data;
      }

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Agendamento criado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar agendamento");
    },
  });
}

