import { z } from "zod";

export const usageByPetReportSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2020).max(2100).optional(),
});

