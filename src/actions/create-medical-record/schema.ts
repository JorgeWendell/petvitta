import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  petId: z.string().min(1, "Pet é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  anamnese: z.object({
    chiefComplaint: z.string().optional(),
    reportedSymptoms: z.string().optional(),
    medicationUse: z.string().optional(),
    temperature: z.string().optional(),
    heartRate: z.string().optional(),
    respiratoryRate: z.string().optional(),
    mucosa: z.enum(["NORMAL", "PALIDA", "ICTERICA"]).optional(),
    hydration: z.enum(["NORMAL", "DESIDRATADO"]).optional(),
  }),
  clinicalDiagnosis: z.string().optional(),
  isReturn: z.boolean().default(false),
  prescriptions: z.array(
    z.object({
      medication: z.string().min(1, "Medicamento é obrigatório"),
      dosage: z.string().min(1, "Dosagem é obrigatória"),
      frequency: z.string().min(1, "Frequência é obrigatória"),
      duration: z.string().min(1, "Duração é obrigatória"),
    })
  ).default([]),
  exams: z.array(
    z.object({
      examName: z.string().min(1, "Nome do exame é obrigatório"),
      result: z.string().optional(),
      examDate: z.string().optional(),
    })
  ).default([]),
  vaccines: z.array(
    z.object({
      vaccineName: z.string().min(1, "Nome da vacina é obrigatório"),
      dose: z.string().min(1, "Dose é obrigatória"),
      vaccineDate: z.string().min(1, "Data é obrigatória"),
      nextDoseDate: z.string().optional(),
    })
  ).default([]),
});

