import { db } from "./db";
import { users, profiles, userRoles, companies, companyMembers, events, content, trainings, courses, enrollments, userActivities, achievements, financialCategories, monthlyPayments, financialTransactions, type User, type InsertUser, type Profile, type Company, type Event, type Training, type Course, type UserActivity, type Achievement, type FinancialCategory, type MonthlyPayment, type FinancialTransaction } from "@shared/schema";
import { eq, and, desc, inArray, isNotNull, gte, lte, sum, count } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile management
  getProfile(userId: string): Promise<Profile | undefined>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined>;
  
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
  
  // User roles
  getUserRoles(userId: string): Promise<string[]>;
  assignRole(userId: string, role: string): Promise<void>;
  
  // User deletion
  deleteUser(userId: string): Promise<void>;
  
  // Activities and achievements
  getUserActivities(userId: string): Promise<UserActivity[]>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Messages (community)
  getChannelMessages(channel: string): Promise<any[]>;
  createMessage(userId: string, channel: string, content: string): Promise<any>;

  // Financial management
  getFinancialCategories(): Promise<FinancialCategory[]>;
  createFinancialCategory(category: any): Promise<FinancialCategory>;
  getMonthlyPayments(month?: number, year?: number): Promise<any[]>;
  createMonthlyPayment(payment: any): Promise<MonthlyPayment>;
  updateMonthlyPayment(paymentId: string, data: any): Promise<MonthlyPayment>;
  getFinancialTransactions(startDate?: string, endDate?: string): Promise<any[]>;
  createFinancialTransaction(transaction: any): Promise<FinancialTransaction>;
  getFinancialSummary(month?: number, year?: number): Promise<any>;
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
    return await db.select().from(events);
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
          id: content.id,
          title: content.title,
          body: content.body,
          author_id: content.author_id,
          created_at: content.created_at,
          views: content.views,
          interactions: content.interactions,
          author_name: profiles.name,
          author_rank: profiles.rank,
          author_company: profiles.company,
        })
        .from(content)
        .leftJoin(profiles, eq(content.author_id, profiles.user_id))
        .where(and(
          eq(content.channel, channel),
          eq(content.status, 'published')
        ))
        .orderBy(desc(content.created_at));
      
      return messages;
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      return [];
    }
  }

  async createMessage(userId: string, channel: string, messageContent: string): Promise<any> {
    try {
      const [newMessage] = await db
        .insert(content)
        .values({
          title: 'Mensagem no Canal Geral',
          body: messageContent,
          type: 'announcement',
          channel: channel,
          author_id: userId,
          status: 'published',
          published_at: new Date(),
        })
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
}

export const storage = new DatabaseStorage();
