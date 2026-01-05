import { z } from "zod";

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1, "ID do agendamento é obrigatório"),
  status: z.enum(["AGENDADO", "CONCLUIDO"]),
});

