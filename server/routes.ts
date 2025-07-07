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
      const updatedProfile = await storage.updateProfile(req.user.id, req.body);
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

  const httpServer = createServer(app);
  return httpServer;
}
