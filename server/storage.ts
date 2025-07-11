import { db } from "./db";
import { users, profiles, userRoles, companies, companyMembers, events, eventRegistrations, content, trainings, courses, enrollments, userActivities, achievements, financialCategories, monthlyPayments, financialTransactions, asaasCustomers, asaasSubscriptions, asaasPayments, asaasWebhooks, generalMessages, type User, type InsertUser, type Profile, type Company, type Event, type EventRegistration, type Training, type Course, type UserActivity, type Achievement, type FinancialCategory, type MonthlyPayment, type FinancialTransaction, type AsaasCustomer, type AsaasSubscription, type AsaasPayment, type AsaasWebhook } from "@shared/schema";
import { eq, and, desc, inArray, isNotNull, gte, lte, sum, count, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByCpf(cpf: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  
  // Profile management
  getProfile(userId: string): Promise<Profile | undefined>;
  getUserProfile(userId: string): Promise<Profile | undefined>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined>;
  getAllProfiles(): Promise<Profile[]>;
  getUsersWithProfiles(): Promise<any[]>;
  
  // Company management
  getCompanies(): Promise<Company[]>;
  getCompanyMembers(companyId: string): Promise<Profile[]>;
  createCompany(company: any): Promise<Company>;
  updateCompany(companyId: string, data: any): Promise<Company>;
  deleteCompany(companyId: string): Promise<void>;
  addCompanyMember(companyId: string, userId: string, role?: string): Promise<void>;
  removeCompanyMember(companyId: string, userId: string): Promise<void>;
  updateMemberRole(companyId: string, userId: string, role: string): Promise<void>;
  getAvailableCommanders(): Promise<Profile[]>;
  getUsersByRank(rank?: string): Promise<Profile[]>;
  
  // Training management
  getTrainings(): Promise<Training[]>;
  
  // Course management
  getCourses(): Promise<Course[]>;
  
  // Event management
  getEvents(): Promise<Event[]>;
  createEvent(event: any): Promise<Event>;
  updateEvent(eventId: string, data: any): Promise<Event>;
  deleteEvent(eventId: string): Promise<void>;
  getEventsByCategory(category: string): Promise<Event[]>;
  
  // User roles
  getUserRoles(userId: string): Promise<string[]>;
  assignRole(userId: string, role: string): Promise<void>;
  

  
  // Activities and achievements
  getUserActivities(userId: string): Promise<UserActivity[]>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Messages (community)
  getChannelMessages(channel: string): Promise<any[]>;
  createMessage(userId: string, channel: string, content: string, parentMessageId?: string, threadId?: string): Promise<any>;

  // Financial management
  getFinancialCategories(): Promise<FinancialCategory[]>;
  getFinancialCategoryByName(name: string): Promise<FinancialCategory | undefined>;
  createFinancialCategory(category: any): Promise<FinancialCategory>;
  getMonthlyPayments(month?: number, year?: number): Promise<any[]>;
  createMonthlyPayment(payment: any): Promise<MonthlyPayment>;
  updateMonthlyPayment(paymentId: string, data: any): Promise<MonthlyPayment>;
  getFinancialTransactions(startDate?: string, endDate?: string): Promise<any[]>;
  createFinancialTransaction(transaction: any): Promise<FinancialTransaction>;
  updateFinancialTransaction(transactionId: string, data: any): Promise<FinancialTransaction>;
  getFinancialSummary(month?: number, year?: number): Promise<any>;

  // Asaas payment integration
  getAsaasCustomer(userId: string): Promise<AsaasCustomer | undefined>;
  createAsaasCustomer(userId: string, asaasCustomerId: string): Promise<AsaasCustomer>;
  getAsaasSubscription(userId: string): Promise<AsaasSubscription | undefined>;
  createAsaasSubscription(data: any): Promise<AsaasSubscription>;
  updateAsaasSubscription(subscriptionId: string, data: any): Promise<AsaasSubscription>;
  getAsaasPayments(userId: string): Promise<AsaasPayment[]>;
  createAsaasPayment(data: any): Promise<AsaasPayment>;
  updateAsaasPayment(paymentId: string, data: any): Promise<AsaasPayment>;
  getPaymentEligibleUsers(): Promise<Profile[]>;
  getUsersWithActiveSubscriptions(): Promise<Profile[]>;
  createAsaasWebhook(data: any): Promise<AsaasWebhook>;
  getUnprocessedWebhooks(): Promise<AsaasWebhook[]>;
  markWebhookProcessed(webhookId: string): Promise<void>;

  // Event registrations
  registerForEvent(eventId: string, userId: string, paymentData?: any): Promise<EventRegistration>;
  unregisterFromEvent(eventId: string, userId: string): Promise<void>;
  getUserEventRegistrations(userId: string): Promise<EventRegistration[]>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  isUserRegisteredForEvent(eventId: string, userId: string): Promise<boolean>;
  updateEventRegistration(registrationId: string, data: any): Promise<EventRegistration>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByCpf(cpf: string): Promise<User | undefined> {
    // First find the profile with this CPF
    const [profile] = await db.select().from(profiles).where(eq(profiles.cpf, cpf));
    if (!profile) return undefined;
    
    // Then get the user data
    const [user] = await db.select().from(users).where(eq(users.id, profile.user_id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    
    // Create default profile
    await db.insert(profiles).values({
      user_id: user.id,
      name: "", // Nome será preenchido pelo usuário no perfil
      email: insertUser.email,
      rank: "aluno",
    });
    
    // Assign default user role
    await db.insert(userRoles).values({
      user_id: user.id,
      role: "user",
    });
    
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.user_id, userId));
    return profile;
  }

  async getUserProfile(userId: string): Promise<Profile | undefined> {
    return this.getProfile(userId);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return await db.select().from(profiles).where(isNotNull(profiles.name));
  }

  async getUsersWithProfiles(): Promise<any[]> {
    const usersWithProfiles = await db
      .select({
        id: users.id,
        email: users.email,
        created_at: users.created_at,
        force_password_change: users.force_password_change,
        profile: {
          id: profiles.id,
          user_id: profiles.user_id,
          name: profiles.name,
          cpf: profiles.cpf,
          rank: profiles.rank,
          company: profiles.company,
          email: profiles.email,
          phone: profiles.phone,
          city: profiles.city,
          birth_date: profiles.birth_date,
          address: profiles.address,
          avatar_url: profiles.avatar_url,
          bio: profiles.bio,
          specialties: profiles.specialties,
          joined_at: profiles.joined_at,
          created_at: profiles.created_at,
          updated_at: profiles.updated_at,
        }
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.user_id))
      .where(isNotNull(profiles.name));
    
    return usersWithProfiles;
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db.update(profiles)
      .set({ ...data, updated_at: new Date() })
      .where(eq(profiles.user_id, userId))
      .returning();
    return profile;
  }

  async getCompanies(): Promise<Company[]> {
    const companiesList = await db
      .select({
        id: companies.id,
        name: companies.name,
        commander_id: companies.commander_id,
        sub_commander_id: companies.sub_commander_id,
        status: companies.status,
        description: companies.description,
        city: companies.city,
        state: companies.state,
        founded_date: companies.founded_date,
        color: companies.color,
        created_at: companies.created_at,
        updated_at: companies.updated_at,
        commander_name: profiles.name,
        commander_rank: profiles.rank,
      })
      .from(companies)
      .leftJoin(users, eq(companies.commander_id, users.id))
      .leftJoin(profiles, eq(users.id, profiles.user_id));
    
    return companiesList as Company[];
  }

  async createCompany(companyData: any): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .returning();
    
    // Add commander and sub-commander as members with appropriate roles
    if (company.commander_id) {
      await this.addCompanyMember(company.id, company.commander_id, 'Comandante');
    }
    if (company.sub_commander_id) {
      await this.addCompanyMember(company.id, company.sub_commander_id, 'Subcomandante');
    }
    
    return company;
  }

  async updateCompany(companyId: string, data: any): Promise<Company> {
    // Convert "none" to null for UUID fields
    const updateData = {
      ...data,
      commander_id: data.commander_id === 'none' ? null : data.commander_id,
      sub_commander_id: data.sub_commander_id === 'none' ? null : data.sub_commander_id,
      updated_at: new Date()
    };

    const [company] = await db
      .update(companies)
      .set(updateData)
      .where(eq(companies.id, companyId))
      .returning();
    return company;
  }

  async deleteCompany(companyId: string): Promise<void> {
    // Remove all members first
    await db.delete(companyMembers).where(eq(companyMembers.company_id, companyId));
    // Then delete the company
    await db.delete(companies).where(eq(companies.id, companyId));
  }

  async getCompanyMembers(companyId: string): Promise<Profile[]> {
    const members = await db.select({
      id: profiles.id,
      user_id: profiles.user_id,
      name: profiles.name,
      cpf: profiles.cpf,
      rank: profiles.rank,
      company: profiles.company,
      email: profiles.email,
      phone: profiles.phone,
      city: profiles.city,
      birth_date: profiles.birth_date,
      address: profiles.address,
      avatar_url: profiles.avatar_url,
      bio: profiles.bio,
      specialties: profiles.specialties,
      joined_at: profiles.joined_at,
      created_at: profiles.created_at,
      updated_at: profiles.updated_at,
      company_role: companyMembers.role,
      joined_date: companyMembers.joined_date,
    })
    .from(companyMembers)
    .innerJoin(profiles, eq(companyMembers.user_id, profiles.user_id))
    .where(eq(companyMembers.company_id, companyId));
    
    return members;
  }

  async addCompanyMember(companyId: string, userId: string, role: string = 'Membro'): Promise<void> {
    // Check if user is already a member of this company
    const existingMember = await db
      .select()
      .from(companyMembers)
      .where(
        and(
          eq(companyMembers.company_id, companyId),
          eq(companyMembers.user_id, userId)
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      throw new Error('Usuário já é membro desta companhia');
    }

    await db.insert(companyMembers).values({
      company_id: companyId,
      user_id: userId,
      role: role
    });
  }

  async removeCompanyMember(companyId: string, userId: string): Promise<void> {
    await db
      .delete(companyMembers)
      .where(
        and(
          eq(companyMembers.company_id, companyId),
          eq(companyMembers.user_id, userId)
        )
      );
  }

  async updateMemberRole(companyId: string, userId: string, role: string): Promise<void> {
    await db
      .update(companyMembers)
      .set({ role })
      .where(
        and(
          eq(companyMembers.company_id, companyId),
          eq(companyMembers.user_id, userId)
        )
      );
  }

  async getAvailableCommanders(): Promise<Profile[]> {
    // Get profiles with ranks suitable for commanding
    const commanderRanks = ['sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante', 'admin'];
    
    const commanders = await db
      .select({
        id: profiles.user_id, // Use user_id instead of profile id for commander_id field
        user_id: profiles.user_id,
        name: profiles.name,
        rank: profiles.rank,
        email: profiles.email,
        phone: profiles.phone,
        city: profiles.city,
        birth_date: profiles.birth_date,
        address: profiles.address,
        avatar_url: profiles.avatar_url,
        bio: profiles.bio,
        specialties: profiles.specialties,
        joined_at: profiles.joined_at,
        created_at: profiles.created_at,
        updated_at: profiles.updated_at,
        cpf: profiles.cpf,
        company: profiles.company
      })
      .from(profiles)
      .where(
        and(
          inArray(profiles.rank, commanderRanks),
          isNotNull(profiles.name)
        )
      );
    
    return commanders;
  }

  async getUsersByRank(rank?: string): Promise<Profile[]> {
    if (rank) {
      return await db
        .select()
        .from(profiles)
        .where(eq(profiles.rank, rank));
    }
    return await db
      .select()
      .from(profiles)
      .where(isNotNull(profiles.name));
  }

  async getTrainings(): Promise<Training[]> {
    return await db.select().from(trainings);
  }

  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(events.start_date);
  }

  async createEvent(eventData: any): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  async updateEvent(eventId: string, data: any): Promise<Event> {
    const [event] = await db
      .update(events)
      .set({ ...data, updated_at: new Date() })
      .where(eq(events.id, eventId))
      .returning();
    return event;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await db.delete(events).where(eq(events.id, eventId));
  }

  async getEventsByCategory(category: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.category, category))
      .orderBy(events.start_date);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const roles = await db.select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.user_id, userId));
    
    return roles.map(r => r.role).filter(role => role !== null) as string[];
  }

  async assignRole(userId: string, role: string): Promise<void> {
    await db.insert(userRoles).values({
      user_id: userId,
      role: role as any,
    }).onConflictDoNothing();
  }

  async getUserActivities(userId: string): Promise<UserActivity[]> {
    const activities = await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.user_id, userId))
      .orderBy(desc(userActivities.created_at))
      .limit(20);
    
    return activities;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    const achievementResults = await db
      .select()
      .from(achievements)
      .where(eq(achievements.user_id, userId))
      .orderBy(desc(achievements.created_at));
    
    return achievementResults;
  }

  async getChannelMessages(channel: string): Promise<any[]> {
    try {
      const messages = await db
        .select({
          id: generalMessages.id,
          user_id: generalMessages.user_id,
          channel: generalMessages.channel,
          content: generalMessages.content,
          created_at: generalMessages.created_at,
          parent_message_id: generalMessages.parent_message_id,
          thread_id: generalMessages.thread_id,
          reply_count: generalMessages.reply_count,
          is_thread_starter: generalMessages.is_thread_starter,
          author_name: profiles.name,
          author_rank: profiles.rank,
          author_company: profiles.company,
          author_avatar: profiles.avatar_url,
        })
        .from(generalMessages)
        .leftJoin(profiles, eq(generalMessages.user_id, profiles.user_id))
        .where(eq(generalMessages.channel, channel))
        .orderBy(desc(generalMessages.created_at))
        .limit(50);
      
      return messages;
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      return [];
    }
  }

  async createMessage(userId: string, channel: string, messageContent: string, parentMessageId?: string, threadId?: string): Promise<any> {
    try {
      const messageData = {
        id: crypto.randomUUID(),
        user_id: userId,
        channel: channel,
        content: messageContent,
        parent_message_id: parentMessageId || null,
        thread_id: threadId || null,
        reply_count: 0,
        is_thread_starter: false,
        created_at: new Date(),
      };

      const [newMessage] = await db
        .insert(generalMessages)
        .values(messageData)
        .returning();
      
      return newMessage;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // First delete all related records to avoid foreign key violations
      await db.delete(content).where(eq(content.author_id, userId));
      await db.delete(enrollments).where(eq(enrollments.user_id, userId));
      await db.delete(userActivities).where(eq(userActivities.user_id, userId));
      await db.delete(companyMembers).where(eq(companyMembers.user_id, userId));
      await db.delete(userRoles).where(eq(userRoles.user_id, userId));
      await db.delete(profiles).where(eq(profiles.user_id, userId));
      
      // Finally delete the user
      await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
  // Asaas payment integration methods
  async getAsaasCustomer(userId: string): Promise<AsaasCustomer | undefined> {
    const [customer] = await db.select().from(asaasCustomers).where(eq(asaasCustomers.user_id, userId));
    return customer;
  }

  async createAsaasCustomer(userId: string, asaasCustomerId: string): Promise<AsaasCustomer> {
    const [customer] = await db.insert(asaasCustomers).values({
      user_id: userId,
      asaas_customer_id: asaasCustomerId,
    }).returning();
    return customer;
  }

  async getAsaasSubscription(userId: string): Promise<AsaasSubscription | undefined> {
    const [subscription] = await db.select().from(asaasSubscriptions).where(eq(asaasSubscriptions.user_id, userId));
    return subscription;
  }

  async createAsaasSubscription(data: any): Promise<AsaasSubscription> {
    const [subscription] = await db.insert(asaasSubscriptions).values(data).returning();
    return subscription;
  }

  async updateAsaasSubscription(subscriptionId: string, data: any): Promise<AsaasSubscription> {
    const [subscription] = await db.update(asaasSubscriptions)
      .set({ ...data, updated_at: new Date() })
      .where(eq(asaasSubscriptions.id, subscriptionId))
      .returning();
    return subscription;
  }

  async getAsaasPayments(userId: string): Promise<AsaasPayment[]> {
    return await db.select().from(asaasPayments)
      .where(eq(asaasPayments.user_id, userId))
      .orderBy(desc(asaasPayments.due_date));
  }

  async createAsaasPayment(data: any): Promise<AsaasPayment> {
    const [payment] = await db.insert(asaasPayments).values(data).returning();
    return payment;
  }

  async updateAsaasPayment(paymentId: string, data: any): Promise<AsaasPayment> {
    const [payment] = await db.update(asaasPayments)
      .set({ ...data, updated_at: new Date() })
      .where(eq(asaasPayments.asaas_payment_id, paymentId))
      .returning();
    return payment;
  }

  async getPaymentEligibleUsers(): Promise<Profile[]> {
    const eligibleRanks = ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante'];
    
    return await db.select()
      .from(profiles)
      .where(
        and(
          isNotNull(profiles.rank),
          inArray(profiles.rank, eligibleRanks)
        )
      );
  }

  async getUsersWithActiveSubscriptions(): Promise<Profile[]> {
    const result = await db.select({
      id: profiles.id,
      user_id: profiles.user_id,
      name: profiles.name,
      rank: profiles.rank,
      email: profiles.email,
      phone: profiles.phone,
      birth_date: profiles.birth_date,
      address: profiles.address,
      avatar_url: profiles.avatar_url,
      bio: profiles.bio,
      specialties: profiles.specialties,
      joined_at: profiles.joined_at,
      created_at: profiles.created_at,
      updated_at: profiles.updated_at,
      company: profiles.company,
      cpf: profiles.cpf,
      city: profiles.city,
    })
    .from(profiles)
    .innerJoin(asaasSubscriptions, eq(profiles.user_id, asaasSubscriptions.user_id))
    .where(eq(asaasSubscriptions.status, 'ACTIVE'));
    
    return result;
  }

  async createAsaasWebhook(data: any): Promise<AsaasWebhook> {
    const [webhook] = await db.insert(asaasWebhooks).values(data).returning();
    return webhook;
  }

  async getUnprocessedWebhooks(): Promise<AsaasWebhook[]> {
    return await db.select().from(asaasWebhooks)
      .where(eq(asaasWebhooks.processed, false))
      .orderBy(asaasWebhooks.created_at);
  }

  async markWebhookProcessed(webhookId: string): Promise<void> {
    await db.update(asaasWebhooks)
      .set({ 
        processed: true, 
        processed_at: new Date() 
      })
      .where(eq(asaasWebhooks.id, webhookId));
  }

  // Financial transaction methods
  async getFinancialCategoryByName(name: string): Promise<FinancialCategory | undefined> {
    const [category] = await db.select()
      .from(financialCategories)
      .where(ilike(financialCategories.name, `%${name}%`))
      .limit(1);
    return category;
  }

  async createFinancialTransaction(transaction: any): Promise<FinancialTransaction> {
    const [newTransaction] = await db.insert(financialTransactions)
      .values({
        ...transaction,
        amount: transaction.amount.toString()
      })
      .returning();
    return newTransaction;
  }

  async updateFinancialTransaction(transactionId: string, data: any): Promise<FinancialTransaction> {
    const [updated] = await db.update(financialTransactions)
      .set({ ...data, updated_at: new Date() })
      .where(eq(financialTransactions.id, transactionId))
      .returning();
    return updated;
  }

  async getFinancialTransactions(startDate?: string, endDate?: string): Promise<FinancialTransaction[]> {
    let query = db.select().from(financialTransactions);
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(financialTransactions.transaction_date, startDate),
          lte(financialTransactions.transaction_date, endDate)
        )
      );
    } else if (startDate) {
      query = query.where(gte(financialTransactions.transaction_date, startDate));
    } else if (endDate) {
      query = query.where(lte(financialTransactions.transaction_date, endDate));
    }
    
    return await query.orderBy(desc(financialTransactions.transaction_date));
  }

  // Event registration methods
  async registerForEvent(eventId: string, userId: string, paymentData?: any): Promise<EventRegistration> {
    const registrationData = {
      event_id: eventId,
      user_id: userId,
      payment_status: paymentData?.status || 'pending',
      asaas_payment_id: paymentData?.asaas_payment_id || null,
      amount_paid: paymentData?.amount_paid ? paymentData.amount_paid.toString() : null,
      payment_method: paymentData?.payment_method || null,
      notes: paymentData?.notes || null
    };

    const [registration] = await db.insert(eventRegistrations).values(registrationData).returning();
    
    // Update event participant count accurately
    const registrationCount = await db.select({ count: count() })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.event_id, eventId));
    
    await db.update(events)
      .set({ 
        registered_participants: registrationCount[0]?.count || 0,
        updated_at: new Date()
      })
      .where(eq(events.id, eventId));

    return registration;
  }

  async unregisterFromEvent(eventId: string, userId: string): Promise<void> {
    await db.delete(eventRegistrations)
      .where(and(
        eq(eventRegistrations.event_id, eventId),
        eq(eventRegistrations.user_id, userId)
      ));

    // Update event registered participants count
    const currentEvent = await db.query.events.findFirst({
      where: eq(events.id, eventId)
    });

    if (currentEvent && currentEvent.registered_participants > 0) {
      await db.update(events)
        .set({ 
          registered_participants: currentEvent.registered_participants - 1,
          updated_at: new Date()
        })
        .where(eq(events.id, eventId));
    }
  }

  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db.select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.user_id, userId))
      .orderBy(desc(eventRegistrations.registration_date));
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db.select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.event_id, eventId))
      .orderBy(desc(eventRegistrations.registration_date));
  }

  async isUserRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
    const [registration] = await db.select()
      .from(eventRegistrations)
      .where(and(
        eq(eventRegistrations.event_id, eventId),
        eq(eventRegistrations.user_id, userId)
      ));
    return !!registration;
  }

  async updateEventRegistration(registrationId: string, data: any): Promise<EventRegistration> {
    const [updated] = await db.update(eventRegistrations)
      .set({ ...data, updated_at: new Date() })
      .where(eq(eventRegistrations.id, registrationId))
      .returning();
    return updated;
  }

  async getFinancialCategories(): Promise<FinancialCategory[]> {
    return await db.select().from(financialCategories).orderBy(financialCategories.name);
  }

  async createFinancialCategory(category: any): Promise<FinancialCategory> {
    const [newCategory] = await db.insert(financialCategories).values(category).returning();
    return newCategory;
  }

  async getMonthlyPayments(month?: number, year?: number): Promise<any[]> {
    let query = db.select().from(monthlyPayments);
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query = query.where(
        and(
          gte(monthlyPayments.due_date, startDate.toISOString().split('T')[0]),
          lte(monthlyPayments.due_date, endDate.toISOString().split('T')[0])
        )
      );
    }
    
    return await query.orderBy(desc(monthlyPayments.due_date));
  }

  async createMonthlyPayment(payment: any): Promise<MonthlyPayment> {
    const [newPayment] = await db.insert(monthlyPayments).values(payment).returning();
    return newPayment;
  }

  async updateMonthlyPayment(paymentId: string, data: any): Promise<MonthlyPayment> {
    const [updated] = await db.update(monthlyPayments)
      .set({ ...data, updated_at: new Date() })
      .where(eq(monthlyPayments.id, paymentId))
      .returning();
    return updated;
  }

  async getFinancialSummary(month?: number, year?: number): Promise<any> {
    const transactions = await this.getFinancialTransactions(
      month && year ? `${year}-${month.toString().padStart(2, '0')}-01` : undefined,
      month && year ? `${year}-${month.toString().padStart(2, '0')}-31` : undefined
    );

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: transactions.length
    };
  }
}

export const storage = new DatabaseStorage();
