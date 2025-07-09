import { pgTable, text, timestamp, integer, boolean, numeric, serial, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  cpf: text("cpf").notNull().unique(),
  birthDate: text("birth_date").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone").notNull(),
  rank: text("rank").notNull().default("aluno"),
  role: text("role").notNull().default("user"),
  companyId: integer("company_id"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companyMembers = pgTable("company_members", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull().default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location"),
  maxParticipants: integer("max_participants"),
  price: numeric("price", { precision: 10, scale: 2 }).default("0"),
  category: text("category").notNull().default("rally"),
  status: text("status").notNull().default("planejamento"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow(),
  paymentStatus: text("payment_status").default("pending"),
  paymentId: text("payment_id"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  channel: text("channel").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const generalMessages = pgTable("general_messages", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const financialTransactions = pgTable("financial_transactions", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  category: text("category").notNull(),
  date: timestamp("date").notNull(),
  userId: integer("user_id"),
  eventId: integer("event_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  asaasSubscriptionId: text("asaas_subscription_id"),
  asaasCustomerId: text("asaas_customer_id"),
  status: text("status").notNull().default("active"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subscriptionId: integer("subscription_id"),
  eventId: integer("event_id"),
  asaasPaymentId: text("asaas_payment_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  billingType: text("billing_type"),
  dueDate: timestamp("due_date"),
  paymentDate: timestamp("payment_date"),
  pixCode: text("pix_code"),
  bankSlipUrl: text("bank_slip_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, timestamp: true });
export const insertTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true });

// Select schemas
export const selectUserSchema = createSelectSchema(users);
export const selectCompanySchema = createSelectSchema(companies);
export const selectEventSchema = createSelectSchema(events);
export const selectMessageSchema = createSelectSchema(messages);
export const selectTransactionSchema = createSelectSchema(financialTransactions);

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type NewCompany = z.infer<typeof insertCompanySchema>;
export type Event = typeof events.$inferSelect;
export type NewEvent = z.infer<typeof insertEventSchema>;
export type Message = typeof messages.$inferSelect;
export type NewMessage = z.infer<typeof insertMessageSchema>;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type NewFinancialTransaction = z.infer<typeof insertTransactionSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;