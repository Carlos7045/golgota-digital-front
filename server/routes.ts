import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { sql } from "drizzle-orm";

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Auth middleware
async function requireAuth(req: Request, res: Response, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const userId = authHeader.replace('Bearer ', '');
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, cpf, phone, city, address, birthYear, company, rank } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Create basic user account
      const userData = insertUserSchema.parse({ email, password });
      const user = await storage.createUser(userData);
      
      // Update profile with additional data from unified form
      const profileData = {
        name: fullName || '',
        cpf: cpf || '',
        phone: phone || '',
        city: city || '',
        address: address || '',
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        company: company || '',
        rank: rank || 'aluno'
      };
      
      await storage.updateProfile(user.id, profileData);
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.status(201).json({ user: userResponse });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password required' });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Get user profile and roles
      const profile = await storage.getProfile(user.id);
      const roles = await storage.getUserRoles(user.id);
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({ 
        user: userResponse,
        profile,
        roles,
        token: user.id // Simple token system for now
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Profile routes
  app.get('/api/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfile(req.user.id);
      const roles = await storage.getUserRoles(req.user.id);
      
      res.json({ profile, roles });
    } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      // Filter out empty fields to avoid database errors
      const updateData = { ...req.body };
      
      // Remove empty date fields
      if (updateData.birth_date === '') {
        delete updateData.birth_date;
      }
      
      // Remove other empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' && key !== 'name') {
          delete updateData[key];
        }
      });
      
      const updatedProfile = await storage.updateProfile(req.user.id, updateData);
      res.json({ profile: updatedProfile });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Company routes
  app.get('/api/companies', requireAuth, async (req: Request, res: Response) => {
    try {
      const companies = await storage.getCompanies();
      res.json({ companies });
    } catch (error) {
      console.error('Companies fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/companies', requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, commander_id, description, color, status } = req.body;
      const company = await storage.createCompany({
        name,
        commander_id,
        description,
        color,
        status: status || 'Planejamento'
      });
      res.json({ company });
    } catch (error) {
      console.error('Company creation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/companies/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.json({ message: 'Company deleted successfully' });
    } catch (error) {
      console.error('Company deletion error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/companies/:id/members', requireAuth, async (req: Request, res: Response) => {
    try {
      const members = await storage.getCompanyMembers(req.params.id);
      res.json({ members });
    } catch (error) {
      console.error('Company members fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Training routes
  app.get('/api/trainings', requireAuth, async (req: Request, res: Response) => {
    try {
      const trainings = await storage.getTrainings();
      res.json({ trainings });
    } catch (error) {
      console.error('Trainings fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Course routes
  app.get('/api/courses', requireAuth, async (req: Request, res: Response) => {
    try {
      const courses = await storage.getCourses();
      res.json({ courses });
    } catch (error) {
      console.error('Courses fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Event routes
  app.get('/api/events', requireAuth, async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json({ events });
    } catch (error) {
      console.error('Events fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Activities routes
  app.get('/api/activities', requireAuth, async (req: Request, res: Response) => {
    try {
      const activities = await storage.getUserActivities(req.user.id);
      res.json({ activities });
    } catch (error) {
      console.error('Activities fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Achievements routes
  app.get('/api/achievements', requireAuth, async (req: Request, res: Response) => {
    try {
      const achievements = await storage.getUserAchievements(req.user.id);
      res.json({ achievements });
    } catch (error) {
      console.error('Achievements fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Messages routes
  app.get('/api/messages/:channel', requireAuth, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getChannelMessages(req.params.channel);
      res.json({ messages });
    } catch (error) {
      console.error('Messages fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/messages/:channel', requireAuth, async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      const message = await storage.createMessage(req.user.id, req.params.channel, content);
      res.json({ message });
    } catch (error) {
      console.error('Message creation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // User profiles routes
  app.get('/api/profiles', requireAuth, async (req: Request, res: Response) => {
    try {
      // Get real profiles from database
      const profiles = await db.execute(sql`
        SELECT 
          u.id as user_id,
          u.email,
          p.name,
          p.rank,
          p.company,
          p.city,
          p.phone,
          p.cpf,
          p.birth_date,
          p.created_at,
          p.updated_at
        FROM users u
        LEFT JOIN profiles p ON u.id = p.user_id
        ORDER BY u.created_at DESC
      `);
      
      res.json({ profiles: profiles.rows });
    } catch (error) {
      console.error('Profiles fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update user profile
  app.put('/api/profiles/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      
      const profile = await storage.updateProfile(userId, updateData);
      
      if (!profile) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      res.json({ profile });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Dashboard stats routes
  app.get('/api/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      // Get real stats from database
      const totalMembersQuery = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at IS NOT NULL`);
      const totalMembers = totalMembersQuery.rows[0]?.count || 0;
      
      const activeEventsQuery = await db.execute(sql`SELECT COUNT(*) as count FROM events WHERE status = 'active'`);
      const activeEvents = activeEventsQuery.rows[0]?.count || 0;
      
      const publishedContentQuery = await db.execute(sql`SELECT COUNT(*) as count FROM content WHERE status = 'published'`);
      const publishedContent = publishedContentQuery.rows[0]?.count || 0;
      
      // Get recent activities from user_activities table
      const recentActivitiesQuery = await db.execute(sql`
        SELECT ua.*, p.name as user_name 
        FROM user_activities ua 
        LEFT JOIN profiles p ON ua.user_id = p.user_id
        ORDER BY ua.created_at DESC 
        LIMIT 5
      `);
      
      // Get upcoming events
      const upcomingEventsQuery = await db.execute(sql`
        SELECT name, event_date, type 
        FROM events 
        WHERE event_date >= CURRENT_DATE AND status != 'cancelled'
        ORDER BY event_date ASC 
        LIMIT 5
      `);
      
      // Get members by rank
      const membersByRankQuery = await db.execute(sql`
        SELECT 
          p.rank,
          COUNT(*) as count
        FROM profiles p
        WHERE p.rank IS NOT NULL AND p.rank != ''
        GROUP BY p.rank
        ORDER BY count DESC
      `);
      
      // Get members by company
      const membersByCompanyQuery = await db.execute(sql`
        SELECT 
          p.company,
          COUNT(*) as count
        FROM profiles p
        WHERE p.company IS NOT NULL AND p.company != ''
        GROUP BY p.company
        ORDER BY count DESC
      `);
      
      const stats = {
        totalMembers: parseInt(totalMembers),
        todayMessages: 0, // Will be implemented when messages system is ready
        activeEvents: parseInt(activeEvents),
        publishedContent: parseInt(publishedContent),
        activities: recentActivitiesQuery.rows.map(row => ({
          user: row.user_name || 'Usuário',
          action: row.activity || 'Atividade registrada',
          time: new Date(row.created_at).toLocaleString('pt-BR')
        })),
        upcomingEvents: upcomingEventsQuery.rows.map(row => ({
          name: row.name,
          date: new Date(row.event_date).toLocaleDateString('pt-BR'),
          type: row.type
        })),
        membersByRank: membersByRankQuery.rows.map(row => ({
          rank: row.rank,
          count: parseInt(row.count)
        })),
        membersByCompany: membersByCompanyQuery.rows.map(row => ({
          company: row.company,
          count: parseInt(row.count)
        }))
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Stats fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
