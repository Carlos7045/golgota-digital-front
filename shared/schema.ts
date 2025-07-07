import { pgTable, text, serial, integer, boolean, uuid, timestamp, date, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const appRoleEnum = pgEnum("app_role", ["admin", "moderator", "user"]);
export const companyStatusEnum = pgEnum("company_status", ["Ativa", "Reorganização", "Planejamento", "Inativa"]);
export const eventTypeEnum = pgEnum("event_type", ["rally", "camp", "training", "meeting"]);
export const eventStatusEnum = pgEnum("event_status", ["planning", "active", "completed", "cancelled"]);
export const contentTypeEnum = pgEnum("content_type", ["announcement", "training", "event", "resource"]);
export const contentStatusEnum = pgEnum("content_status", ["published", "draft", "archived"]);
export const courseLevelEnum = pgEnum("course_level", ["Básico", "Intermediário", "Avançado"]);
export const courseStatusEnum = pgEnum("course_status", ["available", "coming-soon", "discontinued"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["pending", "approved", "completed", "cancelled"]);

// Users table (for auth)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  rank: text("rank"),
  email: text("email"),
  phone: text("phone"),
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
  status: companyStatusEnum("status").default("Planejamento"),
  description: text("description"),
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
  role: text("role").default("Membro"),
  joined_date: date("joined_date").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

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
  event_date: date("event_date").notNull(),
  location: text("location").notNull(),
  duration: text("duration"),
  max_participants: integer("max_participants").default(50),
  registered_participants: integer("registered_participants").default(0),
  status: eventStatusEnum("status").default("planning"),
  description: text("description"),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
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
