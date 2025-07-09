import { pgTable, serial, text, timestamp, integer, boolean, json, uuid } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  force_password_change: boolean('force_password_change').default(false)
});

export const profiles = pgTable('profiles', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  cpf: text('cpf').unique().notNull(),
  birth_date: text('birth_date').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip_code: text('zip_code').notNull(),
  emergency_contact: text('emergency_contact').notNull(),
  emergency_phone: text('emergency_phone').notNull(),
  cpgl_history: text('cpgl_history').notNull(),
  ministry_experience: text('ministry_experience').notNull(),
  rank: text('rank').notNull().default('aluno'),
  company: text('company').notNull(),
  avatar: text('avatar'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  leader_id: integer('leader_id').references(() => users.id),
  created_at: timestamp('created_at').defaultNow()
});

export const company_members = pgTable('company_members', {
  id: serial('id').primaryKey(),
  company_id: integer('company_id').references(() => companies.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  role: text('role').notNull().default('Membro'),
  joined_at: timestamp('joined_at').defaultNow()
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  date: timestamp('date').notNull(),
  end_date: timestamp('end_date'),
  location: text('location').notNull(),
  max_participants: integer('max_participants'),
  registration_fee: integer('registration_fee').default(0),
  status: text('status').notNull().default('planejamento'),
  created_by: integer('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const event_registrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  event_id: integer('event_id').references(() => events.id).notNull(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  payment_status: text('payment_status').default('pending'),
  payment_id: text('payment_id'),
  registered_at: timestamp('registered_at').defaultNow(),
  payment_data: json('payment_data')
});

export const financial_categories = pgTable('financial_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const financial_transactions = pgTable('financial_transactions', {
  id: serial('id').primaryKey(),
  description: text('description').notNull(),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  category_id: integer('category_id').references(() => financial_categories.id),
  user_id: integer('user_id').references(() => users.id),
  date: timestamp('date').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow()
});

export const asaas_customers = pgTable('asaas_customers', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  asaas_customer_id: text('asaas_customer_id').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const asaas_subscriptions = pgTable('asaas_subscriptions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  asaas_subscription_id: text('asaas_subscription_id').notNull(),
  status: text('status').notNull(),
  value: integer('value').notNull(),
  cycle: text('cycle').notNull(),
  next_due_date: timestamp('next_due_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const asaas_payments = pgTable('asaas_payments', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  asaas_payment_id: text('asaas_payment_id').notNull(),
  subscription_id: integer('subscription_id').references(() => asaas_subscriptions.id),
  value: integer('value').notNull(),
  status: text('status').notNull(),
  billing_type: text('billing_type').notNull(),
  due_date: timestamp('due_date').notNull(),
  payment_date: timestamp('payment_date'),
  invoice_url: text('invoice_url'),
  bank_slip_url: text('bank_slip_url'),
  pix_code: text('pix_code'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

export const asaas_webhooks = pgTable('asaas_webhooks', {
  id: serial('id').primaryKey(),
  webhook_id: text('webhook_id').notNull(),
  event: text('event').notNull(),
  data: json('data').notNull(),
  processed: boolean('processed').default(false),
  created_at: timestamp('created_at').defaultNow()
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  channel: text('channel').notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

export const general_messages = pgTable('general_messages', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  company: text('company'),
  created_at: timestamp('created_at').defaultNow()
});