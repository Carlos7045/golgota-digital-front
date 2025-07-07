import { db } from "./db";
import { users, profiles, userRoles, companies, companyMembers, events, content, trainings, courses, enrollments, userActivities, achievements, type User, type InsertUser, type Profile, type Company, type Event, type Training, type Course, type UserActivity, type Achievement } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
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
  deleteCompany(companyId: string): Promise<void>;
  
  // Training management
  getTrainings(): Promise<Training[]>;
  
  // Course management
  getCourses(): Promise<Course[]>;
  
  // Event management
  getEvents(): Promise<Event[]>;
  
  // User roles
  getUserRoles(userId: string): Promise<string[]>;
  assignRole(userId: string, role: string): Promise<void>;
  
  // Activities and achievements
  getUserActivities(userId: string): Promise<UserActivity[]>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  
  // Messages (community)
  getChannelMessages(channel: string): Promise<any[]>;
  createMessage(userId: string, channel: string, content: string): Promise<any>;
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
    return await db.select().from(companies);
  }

  async createCompany(companyData: any): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .returning();
    return company;
  }

  async deleteCompany(companyId: string): Promise<void> {
    await db.delete(companies).where(eq(companies.id, companyId));
  }

  async getCompanyMembers(companyId: string): Promise<Profile[]> {
    const members = await db.select({
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
    })
    .from(companyMembers)
    .innerJoin(profiles, eq(companyMembers.user_id, profiles.user_id))
    .where(eq(companyMembers.company_id, companyId));
    
    return members;
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
}

export const storage = new DatabaseStorage();
