import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "CLINIC", "TUTOR"]);

export const petStatusEnum = pgEnum("pet_status", ["ATIVO", "SUSPENSO"]);

export const petSpeciesEnum = pgEnum("pet_species", [
  "CÃO",
  "GATO",
  "PASSARO",
  "COELHO",
  "HAMSTER",
  "OUTRO",
]);

export const petGenderEnum = pgEnum("pet_gender", ["MACHO", "FÊMEA"]);

export const planStatusEnum = pgEnum("plan_status", ["ATIVO", "INATIVO"]);

export const clinicStatusEnum = pgEnum("clinic_status", ["ATIVO", "INATIVO"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ATIVA",
  "CANCELADA",
  "SUSPENSA",
  "EXPIRADA",
]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "AGENDADO",
  "CONCLUIDO",
  "ATRASADO",
]);

export const mucosaEnum = pgEnum("mucosa", ["NORMAL", "PALIDA", "ICTERICA"]);

export const hydrationEnum = pgEnum("hydration", ["NORMAL", "DESIDRATADO"]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  emailVerified: boolean("email_verified").notNull(),
  role: userRoleEnum("role").notNull().default("TUTOR"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const plansTable = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  carePeriodDays: integer("care_period_days").notNull().default(30), // Carência em dias
  status: planStatusEnum("status").notNull().default("ATIVO"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const petsTable = pgTable("pets", {
  id: text("id").primaryKey(),
  codigo: numeric("codigo", { precision: 16, scale: 0 }).unique(),
  name: text("name").notNull(),
  species: petSpeciesEnum("species").notNull().default("CÃO"),
  breed: text("breed"),
  dateOfBirth: date("date_of_birth"),
  gender: petGenderEnum("gender"),
  status: petStatusEnum("status").notNull().default("ATIVO"),
  tutorId: text("tutor_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  planId: text("plan_id").references(() => plansTable.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  pets: many(petsTable),
  clinic: one(clinicsTable, {
    fields: [usersTable.id],
    references: [clinicsTable.userId],
  }),
}));

export const clinicsTable = pgTable("clinics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  cnpj: text("cnpj").unique(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
  status: clinicStatusEnum("status").notNull().default("ATIVO"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const doctorsTable = pgTable("doctors", {
  id: text("id").primaryKey(),
  clinicId: text("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  availableFromWeekDay: integer("available_from_week_day").notNull(), // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  availableToWeekDay: integer("available_to_week_day").notNull(), // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const clinicsRelations = relations(clinicsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [clinicsTable.userId],
    references: [usersTable.id],
  }),
  doctors: many(doctorsTable),
}));

export const subscriptionsTable = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  petId: text("pet_id")
    .notNull()
    .references(() => petsTable.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => plansTable.id, { onDelete: "restrict" }),
  status: subscriptionStatusEnum("status").notNull().default("ATIVA"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  nextBillingDate: date("next_billing_date"),
  asaasSubscriptionId: text("asaas_subscription_id").unique(), // ID da assinatura no Asaas
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const subscriptionsRelations = relations(
  subscriptionsTable,
  ({ one }) => ({
    pet: one(petsTable, {
      fields: [subscriptionsTable.petId],
      references: [petsTable.id],
    }),
    plan: one(plansTable, {
      fields: [subscriptionsTable.planId],
      references: [plansTable.id],
    }),
  }),
);

export const appointmentsTable = pgTable("appointments", {
  id: text("id").primaryKey(),
  petId: text("pet_id")
    .notNull()
    .references(() => petsTable.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  status: appointmentStatusEnum("status").notNull().default("AGENDADO"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const appointmentsRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    pet: one(petsTable, {
      fields: [appointmentsTable.petId],
      references: [petsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

export const petsRelations = relations(petsTable, ({ one, many }) => ({
  tutor: one(usersTable, {
    fields: [petsTable.tutorId],
    references: [usersTable.id],
  }),
  plan: one(plansTable, {
    fields: [petsTable.planId],
    references: [plansTable.id],
  }),
  subscriptions: many(subscriptionsTable),
  appointments: many(appointmentsTable),
  medicalRecords: many(medicalRecordsTable),
  petVaccines: many(petVaccinesTable),
}));

export const doctorsRelations = relations(doctorsTable, ({ one, many }) => ({
  clinic: one(clinicsTable, {
    fields: [doctorsTable.clinicId],
    references: [clinicsTable.id],
  }),
  appointments: many(appointmentsTable),
  medicalRecords: many(medicalRecordsTable),
}));

export const plansRelations = relations(plansTable, ({ many }) => ({
  pets: many(petsTable),
  subscriptions: many(subscriptionsTable),
}));

export const medicalRecordsTable = pgTable("medical_records", {
  id: text("id").primaryKey(),
  petId: text("pet_id")
    .notNull()
    .references(() => petsTable.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  // Anamnese
  chiefComplaint: text("chief_complaint"), // Queixa principal
  reportedSymptoms: text("reported_symptoms"), // Sintomas relatados
  medicationUse: text("medication_use"), // Uso de medicamentos
  temperature: numeric("temperature", { precision: 4, scale: 1 }), // Temperatura em ºC
  heartRate: integer("heart_rate"), // Frequência cardíaca em bpm
  respiratoryRate: integer("respiratory_rate"), // Frequência respiratória em irpm
  mucosa: mucosaEnum("mucosa"), // Mucosas (normais, pálidas, Ictéricas)
  hydration: hydrationEnum("hydration"), // Hidratação (normal, desidratado)
  // Diagnóstico
  clinicalDiagnosis: text("clinical_diagnosis"), // Diagnóstico clínico
  isReturn: boolean("is_return").notNull().default(false), // Retorno
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const prescriptionsTable = pgTable("prescriptions", {
  id: text("id").primaryKey(),
  medicalRecordId: text("medical_record_id")
    .notNull()
    .references(() => medicalRecordsTable.id, { onDelete: "cascade" }),
  medication: text("medication").notNull(), // Medicamento
  dosage: text("dosage").notNull(), // Dosagem
  frequency: text("frequency").notNull(), // Frequência
  duration: text("duration").notNull(), // Duração
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const examsTable = pgTable("exams", {
  id: text("id").primaryKey(),
  medicalRecordId: text("medical_record_id")
    .notNull()
    .references(() => medicalRecordsTable.id, { onDelete: "cascade" }),
  examName: text("exam_name").notNull(), // Nome do exame
  result: text("result"), // Resultado
  examDate: date("exam_date"), // Data
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const vaccinesTable = pgTable("vaccines", {
  id: text("id").primaryKey(),
  medicalRecordId: text("medical_record_id")
    .notNull()
    .references(() => medicalRecordsTable.id, { onDelete: "cascade" }),
  vaccineName: text("vaccine_name").notNull(), // Nome
  dose: text("dose").notNull(), // Dose
  vaccineDate: date("vaccine_date").notNull(), // Data
  nextDoseDate: date("next_dose_date"), // Próxima dose (data)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const petVaccinesTable = pgTable("pet_vaccines", {
  id: text("id").primaryKey(),
  petId: text("pet_id")
    .notNull()
    .references(() => petsTable.id, { onDelete: "cascade" }),
  vaccineName: text("vaccine_name").notNull(), // Nome
  dose: text("dose").notNull(), // Dose
  vaccineDate: date("vaccine_date").notNull(), // Data
  nextDoseDate: date("next_dose_date"), // Próxima dose (data)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const medicalRecordsRelations = relations(
  medicalRecordsTable,
  ({ one, many }) => ({
    pet: one(petsTable, {
      fields: [medicalRecordsTable.petId],
      references: [petsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [medicalRecordsTable.doctorId],
      references: [doctorsTable.id],
    }),
    prescriptions: many(prescriptionsTable),
    exams: many(examsTable),
    vaccines: many(vaccinesTable),
  }),
);

export const prescriptionsRelations = relations(
  prescriptionsTable,
  ({ one }) => ({
    medicalRecord: one(medicalRecordsTable, {
      fields: [prescriptionsTable.medicalRecordId],
      references: [medicalRecordsTable.id],
    }),
  }),
);

export const examsRelations = relations(examsTable, ({ one }) => ({
  medicalRecord: one(medicalRecordsTable, {
    fields: [examsTable.medicalRecordId],
    references: [medicalRecordsTable.id],
  }),
}));

export const vaccinesRelations = relations(vaccinesTable, ({ one }) => ({
  medicalRecord: one(medicalRecordsTable, {
    fields: [vaccinesTable.medicalRecordId],
    references: [medicalRecordsTable.id],
  }),
}));

export const petVaccinesRelations = relations(petVaccinesTable, ({ one }) => ({
  pet: one(petsTable, {
    fields: [petVaccinesTable.petId],
    references: [petsTable.id],
  }),
}));
