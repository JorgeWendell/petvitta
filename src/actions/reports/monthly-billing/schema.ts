import { z } from "zod";

export const monthlyBillingReportSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

