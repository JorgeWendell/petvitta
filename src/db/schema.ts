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
  qrCode: text("qr_code").unique(),
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

export const clinicsRelations = relations(clinicsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [clinicsTable.userId],
    references: [usersTable.id],
  }),
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
}));

export const plansRelations = relations(plansTable, ({ many }) => ({
  pets: many(petsTable),
  subscriptions: many(subscriptionsTable),
}));
