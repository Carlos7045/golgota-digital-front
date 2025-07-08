import express, { type Request, type Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import multer from "multer";
import { storage } from "./storage.js";
import { asaasService } from "./asaas.js";
import type { Server } from "http";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// Middleware de autenticação
async function requireAuth(req: Request, res: Response, next: any) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Configuração do Multer para upload de arquivos
const upload = multer({
  dest: '/tmp/uploads',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: express.Application): Promise<Server> {
  const httpServer = app.listen(process.env.PORT || 3000, "0.0.0.0");

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('WebSocket message received:', message);
        
        // Echo back for now
        ws.send(JSON.stringify({ 
          type: 'echo', 
          data: message,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Authentication routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Add to company if specified
      if (userData.companyId) {
        await storage.addCompanyMember(userData.companyId, user.id);
      }

      res.status(201).json({ 
        message: "User created successfully",
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session!.userId = user.id;
      res.json({ 
        message: "Login successful",
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Profile routes
  app.get('/api/profile', requireAuth, async (req: Request, res: Response) => {
    res.json({ user: { ...req.user, password: undefined } });
  });

  app.put('/api/profile', requireAuth, async (req: Request, res: Response) => {
    try {
      const updatedUser = await storage.updateUser(req.user.id, req.body);
      res.json({ user: { ...updatedUser, password: undefined } });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post('/api/profile/avatar', requireAuth, upload.single('avatar'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // In production, you'd save this to a proper file storage service
      const avatarPath = `/uploads/${req.file.filename}`;
      
      const updatedUser = await storage.updateUser(req.user.id, { avatar: avatarPath });
      res.json({ 
        message: "Avatar updated successfully",
        user: { ...updatedUser, password: undefined }
      });
    } catch (error) {
      console.error("Avatar upload error:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });

  // Company routes
  app.get('/api/companies', requireAuth, async (req: Request, res: Response) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Companies fetch error:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get('/api/companies/:id/members', requireAuth, async (req: Request, res: Response) => {
    try {
      const members = await storage.getCompanyMembers(parseInt(req.params.id));
      res.json(members);
    } catch (error) {
      console.error("Company members fetch error:", error);
      res.status(500).json({ message: "Failed to fetch company members" });
    }
  });

  // Event routes
  app.get('/api/events', requireAuth, async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      let events;
      
      if (category) {
        events = await storage.getEventsByCategory(category);
      } else {
        events = await storage.getEvents();
      }
      
      res.json(events);
    } catch (error) {
      console.error("Events fetch error:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post('/api/events', requireAuth, async (req: Request, res: Response) => {
    try {
      const event = await storage.createEvent({
        ...req.body,
        createdBy: req.user.id
      });
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.post('/api/events/:id/register', requireAuth, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;

      const isRegistered = await storage.isUserRegisteredForEvent(eventId, userId);
      if (isRegistered) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      const registration = await storage.registerForEvent(eventId, userId);
      res.status(201).json(registration);
    } catch (error) {
      console.error("Event registration error:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.delete('/api/events/:id/register', requireAuth, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = req.user.id;

      await storage.unregisterFromEvent(eventId, userId);
      res.json({ message: "Unregistered successfully" });
    } catch (error) {
      console.error("Event unregistration error:", error);
      res.status(500).json({ message: "Failed to unregister from event" });
    }
  });

  // Message routes
  app.get('/api/messages/:channel', requireAuth, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getChannelMessages(req.params.channel);
      res.json(messages);
    } catch (error) {
      console.error("Messages fetch error:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages/:channel', requireAuth, async (req: Request, res: Response) => {
    try {
      const message = await storage.createMessage(
        req.user.id,
        req.params.channel,
        req.body.content
      );
      res.status(201).json(message);
    } catch (error) {
      console.error("Message creation error:", error);
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Financial routes
  app.get('/api/financial/transactions', requireAuth, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      const transactions = await storage.getFinancialTransactions(
        startDate as string,
        endDate as string
      );
      res.json(transactions);
    } catch (error) {
      console.error("Transactions fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post('/api/financial/transactions', requireAuth, async (req: Request, res: Response) => {
    try {
      const transaction = await storage.createFinancialTransaction({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Transaction creation error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get('/api/financial/summary', requireAuth, async (req: Request, res: Response) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json(summary);
    } catch (error) {
      console.error("Financial summary error:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Payment routes
  app.get('/api/payments/subscription', requireAuth, async (req: Request, res: Response) => {
    try {
      const subscription = await storage.getUserSubscription(req.user.id);
      res.json(subscription);
    } catch (error) {
      console.error("Subscription fetch error:", error);
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.get('/api/payments/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const payments = await storage.getUserPayments(req.user.id);
      res.json(payments);
    } catch (error) {
      console.error("Payment history error:", error);
      res.status(500).json({ message: "Failed to fetch payment history" });
    }
  });

  app.post('/api/payments/create-subscription', requireAuth, async (req: Request, res: Response) => {
    try {
      // Create Asaas customer and subscription
      const user = req.user;
      const customerData = {
        name: user.name,
        email: user.email,
        cpfCnpj: user.cpf.replace(/\D/g, ''),
        phone: user.phone
      };

      const asaasCustomer = await asaasService.createCustomer(customerData);
      
      const subscriptionData = {
        customer: asaasCustomer.id,
        billingType: 'PIX' as const,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 10.00,
        cycle: 'MONTHLY' as const,
        description: 'Mensalidade Comando Gólgota'
      };

      const asaasSubscription = await asaasService.createSubscription(subscriptionData);
      
      // Save to database
      const subscription = await storage.createSubscription({
        userId: user.id,
        asaasSubscriptionId: asaasSubscription.id,
        asaasCustomerId: asaasCustomer.id,
        amount: "10.00",
        dueDate: new Date(subscriptionData.nextDueDate)
      });

      res.status(201).json(subscription);
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Stats routes
  app.get('/api/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const summary = await storage.getFinancialSummary();
      res.json({
        totalMembers: 15, // You can implement this
        totalEvents: 8,   // You can implement this  
        totalIncome: summary.totalIncome,
        totalExpenses: summary.totalExpenses
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  return httpServer;
}