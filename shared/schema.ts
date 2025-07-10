import { pgTable, text, serial, integer, boolean, uuid, timestamp, date, decimal, pgEnum, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const appRoleEnum = pgEnum("app_role", ["admin", "moderator", "user"]);
export const companyStatusEnum = pgEnum("company_status", ["Ativa", "Reorganização", "Planejamento", "Inativa"]);
export const eventTypeEnum = pgEnum("event_type", ["rally", "cplg", "feg", "acampamento", "campanha", "doacao"]);
export const eventCategoryEnum = pgEnum("event_category", ["treinamento", "acampamento", "campanha"]);
export const eventStatusEnum = pgEnum("event_status", ["planning", "published", "registration_open", "final_days", "active", "completed", "cancelled"]);
export const contentTypeEnum = pgEnum("content_type", ["announcement", "training", "event", "resource"]);
export const contentStatusEnum = pgEnum("content_status", ["published", "draft", "archived"]);
export const courseLevelEnum = pgEnum("course_level", ["Básico", "Intermediário", "Avançado"]);
export const courseStatusEnum = pgEnum("course_status", ["available", "coming-soon", "discontinued"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["pending", "approved", "completed", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "overdue", "cancelled"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bank_transfer", "pix", "credit_card", "debit_card", "boleto", "other"]);
export const asaasBillingTypeEnum = pgEnum("asaas_billing_type", ["PIX", "BOLETO", "CREDIT_CARD", "DEBIT_CARD", "UNDEFINED"]);

// Users table (for auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  force_password_change: boolean("force_password_change").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  cpf: text("cpf"),
  rank: text("rank"),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  city: text("city"),
  birth_date: date("birth_date"),
  address: text("address"),
  avatar_url: text("avatar_url"),
  bio: text("bio"),
  specialties: text("specialties").array(),
  joined_at: timestamp("joined_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  commander_id: uuid("commander_id").references(() => users.id),
  sub_commander_id: uuid("sub_commander_id").references(() => users.id),
  status: companyStatusEnum("status").default("Planejamento"),
  description: text("description"),
  city: text("city"),
  state: text("state"),
  founded_date: date("founded_date"),
  color: text("color").default("#FFD700"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Company members table
export const companyMembers = pgTable("company_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  company_id: uuid("company_id").notNull().references(() => companies.id),
  role: text("role").default("Membro"), // Membro, Comandante, Subcomandante
  joined_date: date("joined_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userCompanyUnique: unique().on(table.user_id, table.company_id),
}));

// User roles table
export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  role: appRoleEnum("role").default("user"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: eventTypeEnum("type").notNull(),
  category: eventCategoryEnum("category").notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  location: text("location").notNull(),
  duration: text("duration"),
  max_participants: integer("max_participants").default(50),
  registered_participants: integer("registered_participants").default(0),
  status: eventStatusEnum("status").default("planning"),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  asaas_product_id: text("asaas_product_id"),
  requirements: text("requirements"),
  objectives: text("objectives"),
  instructor: text("instructor"),
  created_by: uuid("created_by").references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Content table
export const content = pgTable("content", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  body: text("body"),
  type: contentTypeEnum("type").notNull(),
  channel: text("channel").notNull(),
  author_id: uuid("author_id").notNull().references(() => users.id),
  status: contentStatusEnum("status").default("draft"),
  views: integer("views").default(0),
  interactions: integer("interactions").default(0),
  published_at: timestamp("published_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Trainings table
export const trainings = pgTable("trainings", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  max_participants: integer("max_participants").default(30),
  current_participants: integer("current_participants").default(0),
  next_session: timestamp("next_session"),
  location: text("location"),
  status: text("status").default("Inscrições Abertas"),
  requirements: text("requirements").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Courses table
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  level: courseLevelEnum("level").default("Básico"),
  duration: text("duration"),
  price: decimal("price", { precision: 10, scale: 2 }),
  instructor: text("instructor"),
  modules: integer("modules").default(1),
  students: integer("students").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.0"),
  image_url: text("image_url"),
  status: courseStatusEnum("status").default("available"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Enrollments table
export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  event_id: uuid("event_id").references(() => events.id),
  training_id: uuid("training_id").references(() => trainings.id),
  course_id: uuid("course_id").references(() => courses.id),
  status: enrollmentStatusEnum("status").default("pending"),
  enrolled_at: timestamp("enrolled_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

// User activities table
export const userActivities = pgTable("user_activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  points: integer("points").default(0),
  activity_date: date("activity_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").default("award"),
  achieved_date: date("achieved_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Financial categories table
export const financialCategories = pgTable("financial_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: transactionTypeEnum("type").notNull(), // income or expense
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Monthly payments table (mensalidades)
export const monthlyPayments = pgTable("monthly_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  due_date: date("due_date").notNull(),
  payment_date: date("payment_date"),
  status: paymentStatusEnum("status").default("pending"),
  payment_method: paymentMethodEnum("payment_method"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Financial transactions table
export const financialTransactions = pgTable("financial_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  category_id: uuid("category_id").references(() => financialCategories.id),
  user_id: uuid("user_id").references(() => users.id), // who made the transaction (optional)
  transaction_date: date("transaction_date").notNull(),
  payment_method: paymentMethodEnum("payment_method"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Asaas payment integration tables
export const asaasCustomers = pgTable("asaas_customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  asaas_customer_id: text("asaas_customer_id").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const asaasSubscriptions = pgTable("asaas_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  asaas_subscription_id: text("asaas_subscription_id").notNull().unique(),
  asaas_customer_id: text("asaas_customer_id").notNull(),
  status: text("status").notNull().default("ACTIVE"), // ACTIVE, CANCELLED, EXPIRED
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  cycle: text("cycle").notNull().default("MONTHLY"),
  next_due_date: timestamp("next_due_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const asaasPayments = pgTable("asaas_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  subscription_id: uuid("subscription_id").references(() => asaasSubscriptions.id, { onDelete: "cascade" }),
  asaas_payment_id: text("asaas_payment_id").notNull().unique(),
  asaas_customer_id: text("asaas_customer_id").notNull(),
  asaas_subscription_id: text("asaas_subscription_id"),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  net_value: decimal("net_value", { precision: 10, scale: 2 }),
  status: text("status").notNull(), // PENDING, RECEIVED, OVERDUE, CANCELLED
  billing_type: text("billing_type").notNull(), // BOLETO, PIX, CREDIT_CARD
  due_date: timestamp("due_date").notNull(),
  payment_date: timestamp("payment_date"),
  description: text("description"),
  invoice_url: text("invoice_url"),
  bank_slip_url: text("bank_slip_url"),
  pix_code: text("pix_code"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const asaasWebhooks = pgTable("asaas_webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_id: text("event_id").notNull().unique(),
  event_type: text("event_type").notNull(),
  payment_id: text("payment_id"),
  subscription_id: text("subscription_id"),
  customer_id: text("customer_id"),
  processed: boolean("processed").default(false),
  processed_at: timestamp("processed_at"),
  raw_data: text("raw_data").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Event Registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_id: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  registration_date: timestamp("registration_date").defaultNow().notNull(),
  payment_status: text("payment_status").default("pending"), // pending, paid, cancelled
  asaas_payment_id: text("asaas_payment_id"),
  amount_paid: decimal("amount_paid", { precision: 10, scale: 2 }),
  payment_method: text("payment_method"), // PIX, BOLETO, CREDIT_CARD
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// General messages and announcements table
export const generalMessages = pgTable("general_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  channel: text("channel").notNull().default("general"),
  content: text("content").notNull(),
  parent_message_id: uuid("parent_message_id").references(() => generalMessages.id, { onDelete: "cascade" }),
  thread_id: uuid("thread_id"),
  reply_count: integer("reply_count").default(0),
  is_thread_starter: boolean("is_thread_starter").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  force_password_change: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertTrainingSchema = createInsertSchema(trainings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Type exports
export const insertFinancialCategorySchema = createInsertSchema(financialCategories).omit({
  id: true,
  created_at: true,
});

export const insertMonthlyPaymentSchema = createInsertSchema(monthlyPayments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAsaasCustomerSchema = createInsertSchema(asaasCustomers).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAsaasSubscriptionSchema = createInsertSchema(asaasSubscriptions).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAsaasPaymentSchema = createInsertSchema(asaasPayments).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertAsaasWebhookSchema = createInsertSchema(asaasWebhooks).omit({
  id: true,
  created_at: true,
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Content = typeof content.$inferSelect;
export type Training = typeof trainings.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type UserActivity = typeof userActivities.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type FinancialCategory = typeof financialCategories.$inferSelect;
export type MonthlyPayment = typeof monthlyPayments.$inferSelect;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type AsaasCustomer = typeof asaasCustomers.$inferSelect;
export type AsaasSubscription = typeof asaasSubscriptions.$inferSelect;
export type AsaasPayment = typeof asaasPayments.$inferSelect;
export type AsaasWebhook = typeof asaasWebhooks.$inferSelect;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
