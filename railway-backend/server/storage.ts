import { db } from "./db.js";
import { 
  users, companies, companyMembers, events, eventRegistrations, 
  messages, generalMessages, financialTransactions, subscriptions, payments,
  type User, type NewUser, type Company, type Event, type EventRegistration, 
  type FinancialTransaction, type Subscription, type Payment
} from "../shared/schema.js";
import { eq, and, desc, sum, count, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: NewUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // Company management
  getCompanies(): Promise<Company[]>;
  getCompanyMembers(companyId: number): Promise<any[]>;
  createCompany(company: Partial<Company>): Promise<Company>;
  addCompanyMember(companyId: number, userId: number, role?: string): Promise<void>;
  
  // Event management
  getEvents(): Promise<Event[]>;
  getEventsByCategory(category: string): Promise<Event[]>;
  createEvent(event: Partial<Event>): Promise<Event>;
  updateEvent(eventId: number, data: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(eventId: number): Promise<void>;
  
  // Event registrations
  registerForEvent(eventId: number, userId: number): Promise<EventRegistration>;
  unregisterFromEvent(eventId: number, userId: number): Promise<void>;
  getUserEventRegistrations(userId: number): Promise<EventRegistration[]>;
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  isUserRegisteredForEvent(eventId: number, userId: number): Promise<boolean>;
  
  // Messages
  getChannelMessages(channel: string): Promise<any[]>;
  createMessage(userId: number, channel: string, content: string): Promise<any>;
  getGeneralMessages(companyId: number): Promise<any[]>;
  createGeneralMessage(companyId: number, userId: number, content: string): Promise<any>;
  
  // Financial
  getFinancialTransactions(startDate?: string, endDate?: string): Promise<FinancialTransaction[]>;
  createFinancialTransaction(transaction: Partial<FinancialTransaction>): Promise<FinancialTransaction>;
  getFinancialSummary(): Promise<any>;
  
  // Subscriptions & Payments
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(data: Partial<Subscription>): Promise<Subscription>;
  getUserPayments(userId: number): Promise<Payment[]>;
  createPayment(data: Partial<Payment>): Promise<Payment>;
  updatePayment(paymentId: number, data: Partial<Payment>): Promise<Payment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: NewUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db.insert(users).values({
      ...user,
      password: hashedPassword
    }).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompanyMembers(companyId: number): Promise<any[]> {
    return await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      rank: users.rank,
      role: companyMembers.role,
      joinedAt: companyMembers.joinedAt
    })
    .from(companyMembers)
    .innerJoin(users, eq(companyMembers.userId, users.id))
    .where(eq(companyMembers.companyId, companyId));
  }

  async createCompany(company: Partial<Company>): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async addCompanyMember(companyId: number, userId: number, role: string = "member"): Promise<void> {
    await db.insert(companyMembers).values({ companyId, userId, role });
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.category, category))
      .orderBy(desc(events.startDate));
  }

  async createEvent(event: Partial<Event>): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(eventId: number, data: Partial<Event>): Promise<Event | undefined> {
    const [updatedEvent] = await db.update(events)
      .set(data)
      .where(eq(events.id, eventId))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(eventId: number): Promise<void> {
    await db.delete(events).where(eq(events.id, eventId));
  }

  async registerForEvent(eventId: number, userId: number): Promise<EventRegistration> {
    const [registration] = await db.insert(eventRegistrations)
      .values({ eventId, userId })
      .returning();
    return registration;
  }

  async unregisterFromEvent(eventId: number, userId: number): Promise<void> {
    await db.delete(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
  }

  async getUserEventRegistrations(userId: number): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.userId, userId));
  }

  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async isUserRegisteredForEvent(eventId: number, userId: number): Promise<boolean> {
    const [registration] = await db.select().from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
    return !!registration;
  }

  async getChannelMessages(channel: string): Promise<any[]> {
    return await db.select({
      id: messages.id,
      content: messages.content,
      timestamp: messages.timestamp,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        rank: users.rank
      }
    })
    .from(messages)
    .innerJoin(users, eq(messages.userId, users.id))
    .where(eq(messages.channel, channel))
    .orderBy(desc(messages.timestamp))
    .limit(50);
  }

  async createMessage(userId: number, channel: string, content: string): Promise<any> {
    const [message] = await db.insert(messages)
      .values({ userId, channel, content })
      .returning();
    return message;
  }

  async getGeneralMessages(companyId: number): Promise<any[]> {
    return await db.select({
      id: generalMessages.id,
      content: generalMessages.content,
      timestamp: generalMessages.timestamp,
      user: {
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        rank: users.rank
      }
    })
    .from(generalMessages)
    .innerJoin(users, eq(generalMessages.userId, users.id))
    .where(eq(generalMessages.companyId, companyId))
    .orderBy(desc(generalMessages.timestamp))
    .limit(50);
  }

  async createGeneralMessage(companyId: number, userId: number, content: string): Promise<any> {
    const [message] = await db.insert(generalMessages)
      .values({ companyId, userId, content })
      .returning();
    return message;
  }

  async getFinancialTransactions(startDate?: string, endDate?: string): Promise<FinancialTransaction[]> {
    let query = db.select().from(financialTransactions);
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(financialTransactions.date, new Date(startDate)),
        lte(financialTransactions.date, new Date(endDate))
      ));
    }
    
    return await query.orderBy(desc(financialTransactions.date));
  }

  async createFinancialTransaction(transaction: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const [newTransaction] = await db.insert(financialTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getFinancialSummary(): Promise<any> {
    const [income] = await db.select({ 
      total: sum(financialTransactions.amount) 
    })
    .from(financialTransactions)
    .where(eq(financialTransactions.type, 'income'));

    const [expenses] = await db.select({ 
      total: sum(financialTransactions.amount) 
    })
    .from(financialTransactions)
    .where(eq(financialTransactions.type, 'expense'));

    const [transactionCount] = await db.select({ 
      count: count() 
    })
    .from(financialTransactions);

    return {
      totalIncome: Number(income?.total || 0),
      totalExpenses: Number(expenses?.total || 0),
      netBalance: Number(income?.total || 0) - Number(expenses?.total || 0),
      transactionCount: transactionCount?.count || 0
    };
  }

  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async createSubscription(data: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(data).returning();
    return subscription;
  }

  async getUserPayments(userId: number): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(data: Partial<Payment>): Promise<Payment> {
    const [payment] = await db.insert(payments).values(data).returning();
    return payment;
  }

  async updatePayment(paymentId: number, data: Partial<Payment>): Promise<Payment | undefined> {
    const [updatedPayment] = await db.update(payments)
      .set(data)
      .where(eq(payments.id, paymentId))
      .returning();
    return updatedPayment;
  }
}

export const storage = new DatabaseStorage();