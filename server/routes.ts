import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

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
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userResponse } = user;
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
      // For now, return mock data - in real implementation, you'd get from database
      const profiles = [
        { user_id: '1', name: 'João Silva', email: 'joao@exemplo.com', rank: 'soldado', created_at: '2025-01-01', updated_at: '2025-01-01' },
        { user_id: '2', name: 'Maria Santos', email: 'maria@exemplo.com', rank: 'cabo', created_at: '2025-01-01', updated_at: '2025-01-01' },
        { user_id: '3', name: 'Pedro Costa', email: 'pedro@exemplo.com', rank: 'sargento', created_at: '2025-01-01', updated_at: '2025-01-01' }
      ];
      res.json({ profiles });
    } catch (error) {
      console.error('Profiles fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Dashboard stats routes
  app.get('/api/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      // For now, return mock stats - in real implementation, you'd calculate from database
      const stats = {
        totalMembers: 150,
        todayMessages: 45,
        activeEvents: 3,
        activities: [
          { user: 'João Silva', action: 'Completou treinamento de combate', time: '2 horas atrás' },
          { user: 'Maria Santos', action: 'Participou do rally noturno', time: '4 horas atrás' },
          { user: 'Pedro Costa', action: 'Atingiu nova patente', time: '6 horas atrás' },
          { user: 'Ana Lima', action: 'Concluiu missão especial', time: '8 horas atrás' }
        ],
        upcomingEvents: [
          { name: 'Treinamento de Resgate', date: '2025-01-10', time: '14:00' },
          { name: 'Rally Mensal', date: '2025-01-15', time: '19:00' },
          { name: 'Cerimônia de Promoção', date: '2025-01-20', time: '10:00' }
        ]
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
