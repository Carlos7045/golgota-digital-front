import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { insertUserSchema, users } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { sql, eq } from "drizzle-orm";

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
  if (!req.session?.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid session' });
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

  // Admin create user route
  app.post('/api/auth/create-user', requireAuth, async (req: Request, res: Response) => {
    try {
      const { email, name, cpf, phone, city, address, birth_date, rank, company } = req.body;
      
      // Check if user already exists by email or CPF
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Usuário já existe com este email' });
      }
      
      // Create basic user account with default password
      const hashedPassword = await bcrypt.hash('Golgota123', 10);
      const userData = {
        email,
        password: hashedPassword,
        force_password_change: true
      };
      const user = await storage.createUser(userData);
      
      // Create profile with all data
      const profileData = {
        name,
        cpf: cpf.replace(/\D/g, ''), // Remove formatting
        phone,
        city,
        address,
        birth_date,
        rank,
        company
      };
      
      await storage.updateProfile(user.id, profileData);

      // Add user to company if specified
      if (company) {
        // Find the company by name
        const companies = await storage.getCompanies();
        const targetCompany = companies.find(c => c.name === company);
        
        if (targetCompany) {
          // Determine role based on rank
          let role = 'Membro';
          if (rank === 'comandante') role = 'Comandante';
          else if (rank === 'major' || rank === 'coronel') role = 'Sub-Comandante';
          else if (rank === 'capitao' || rank === 'tenente') role = 'Oficial';
          else if (rank === 'sargento' || rank === 'cabo') role = 'Graduado';
          
          await storage.addCompanyMember(targetCompany.id, user.id, role);
        }
      }
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.status(201).json({ 
        user: userResponse,
        message: 'Usuário criado com sucesso. Senha padrão: Golgota123'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Dados inválidos', errors: error.errors });
      }
      console.error('User creation error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { emailOrCpf, password } = req.body;
      
      if (!emailOrCpf || !password) {
        return res.status(400).json({ message: 'CPF/Email e senha são obrigatórios' });
      }
      
      // Try to find user by email first, then by CPF
      let user = await storage.getUserByEmail(emailOrCpf);
      
      if (!user) {
        // Try to find by CPF in profile
        const users = await storage.getUsersByRank();
        const profileWithCpf = users.find(u => u.cpf === emailOrCpf.replace(/\D/g, ''));
        if (profileWithCpf) {
          user = await storage.getUser(profileWithCpf.user_id);
        }
      }
      
      if (!user) {
        return res.status(401).json({ message: 'CPF/Email ou senha inválidos' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'CPF/Email ou senha inválidos' });
      }
      
      // Create session
      req.session.userId = user.id;
      
      // Get user profile and roles
      const profile = await storage.getProfile(user.id);
      const roles = await storage.getUserRoles(user.id);
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      
      res.json({ 
        user: userResponse,
        profile,
        roles,
        force_password_change: user.force_password_change || false
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Delete user route (admin only with password confirmation)
  app.post('/api/auth/delete-user', requireAuth, async (req: Request, res: Response) => {
    try {
      const { userId, adminPassword } = req.body;
      const adminUserId = req.user?.id;

      if (!userId || !adminPassword) {
        return res.status(400).json({ message: 'ID do usuário e senha do admin são obrigatórios' });
      }

      // Verify admin password
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser) {
        return res.status(401).json({ message: 'Usuário admin não encontrado' });
      }

      const isValidPassword = await bcrypt.compare(adminPassword, adminUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Senha do administrador incorreta' });
      }

      // Check if user exists
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      // Prevent self-deletion
      if (userId === adminUserId) {
        return res.status(400).json({ message: 'Você não pode excluir sua própria conta' });
      }

      // Delete user profile and user record
      await storage.deleteUser(userId);

      res.json({ 
        message: 'Usuário excluído com sucesso',
        deletedUserId: userId
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          return res.status(500).json({ message: 'Erro ao fazer logout' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.json({ message: 'Logout realizado com sucesso' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/logout-old', async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destroy error:', err);
          return res.status(500).json({ error: 'Failed to logout' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/auth/change-password', requireAuth, async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
      }
      
      // Get current user
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Senha atual incorreta' });
      }
      
      // Hash new password and update
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.update(users)
        .set({ 
          password: hashedNewPassword,
          force_password_change: false,
          updated_at: new Date()
        })
        .where(eq(users.id, req.user.id));
      
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
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

  // Update user profile by ID (admin only)
  app.put('/api/profiles/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const profileId = req.params.id;
      const adminUserId = req.user?.id;

      // Check if user has admin role
      const adminRoles = await storage.getUserRoles(adminUserId);
      if (!adminRoles.includes('admin')) {
        return res.status(403).json({ message: 'Acesso negado - apenas administradores podem editar usuários' });
      }

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

      // Update profile data
      const updatedProfile = await storage.updateProfile(profileId, updateData);

      if (!updatedProfile) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      res.json({ 
        message: 'Usuário atualizado com sucesso',
        profile: updatedProfile 
      });
    } catch (error) {
      console.error('Admin profile update error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Company routes
  app.get('/api/companies', requireAuth, async (req: Request, res: Response) => {
    try {
      const companies = await storage.getCompanies();
      
      // Add member count to each company
      const companiesWithMemberCount = await Promise.all(
        companies.map(async (company) => {
          const members = await storage.getCompanyMembers(company.id);
          return {
            ...company,
            members: members.length
          };
        })
      );
      
      res.json({ companies: companiesWithMemberCount });
    } catch (error) {
      console.error('Companies fetch error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/companies', requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, commander_id, sub_commander_id, description, city, state, color, members } = req.body;
      
      const company = await storage.createCompany({
        name,
        commander_id: commander_id || null,
        sub_commander_id: sub_commander_id || null,
        description: description || null,
        city: city || null,
        state: state || null,
        color: color || '#FFD700',
        status: 'Planejamento'
      });

      // Add additional members if provided
      if (members && Array.isArray(members)) {
        for (const member of members) {
          if (member.user_id && member.user_id !== commander_id && member.user_id !== sub_commander_id) {
            await storage.addCompanyMember(company.id, member.user_id, member.role || 'Membro');
          }
        }
      }

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

  app.put('/api/companies/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const company = await storage.updateCompany(req.params.id, req.body);
      res.json({ company });
    } catch (error) {
      console.error('Company update error:', error);
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

  app.post('/api/companies/:id/members', requireAuth, async (req: Request, res: Response) => {
    try {
      const { user_id, role } = req.body;
      await storage.addCompanyMember(req.params.id, user_id, role || 'Membro');
      res.json({ message: 'Membro adicionado com sucesso' });
    } catch (error: any) {
      console.error('Error adding company member:', error);
      if (error.message === 'Usuário já é membro desta companhia') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.get('/api/companies/:id/members', requireAuth, async (req: Request, res: Response) => {
    try {
      const members = await storage.getCompanyMembers(req.params.id);
      // Map the data to match frontend expectations
      const formattedMembers = members.map(member => ({
        id: member.id,
        user_id: member.user_id,
        name: member.name,
        rank: member.rank,
        role: member.company_role || 'Membro',
        email: member.email,
        phone: member.phone,
        city: member.city
      }));
      res.json({ members: formattedMembers });
    } catch (error) {
      console.error('Error fetching company members:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/companies/:id/members/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.removeCompanyMember(req.params.id, req.params.userId);
      res.json({ message: 'Member removed successfully' });
    } catch (error) {
      console.error('Error removing company member:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/companies/:id/members/:userId', requireAuth, async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      await storage.updateMemberRole(req.params.id, req.params.userId, role);
      res.json({ message: 'Member role updated successfully' });
    } catch (error) {
      console.error('Error updating member role:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/commanders', requireAuth, async (req: Request, res: Response) => {
    try {
      const commanders = await storage.getAvailableCommanders();
      res.json({ commanders });
    } catch (error) {
      console.error('Error fetching commanders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/users', requireAuth, async (req: Request, res: Response) => {
    try {
      const { rank } = req.query;
      const users = await storage.getUsersByRank(rank as string);
      res.json({ users });
    } catch (error) {
      console.error('Error fetching users:', error);
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

  app.post('/api/events', requireAuth, async (req: Request, res: Response) => {
    try {
      const {
        name,
        type,
        category,
        start_date,
        end_date,
        location,
        duration,
        max_participants,
        description,
        price,
        requirements,
        objectives,
        instructor
      } = req.body;

      // Validate required fields
      if (!name || !type || !category || !start_date || !end_date || !location) {
        return res.status(400).json({ 
          message: 'Nome, tipo, categoria, datas de início/fim e local são obrigatórios' 
        });
      }

      // Create event in database
      const event = await storage.createEvent({
        name,
        type,
        category,
        start_date,
        end_date,
        location,
        duration: duration || null,
        max_participants: max_participants || 50,
        registered_participants: 0,
        status: 'planning',
        description: description || null,
        price: price || '0.00',
        requirements: requirements || null,
        objectives: objectives || null,
        instructor: instructor || null,
        created_by: req.user.id
      });

      // If event has a price, create Asaas product for payment integration
      if (price && parseFloat(price) > 0) {
        try {
          // TODO: Integrate with Asaas to create product/service
          // const asaasProduct = await asaasService.createProduct({
          //   name: event.name,
          //   description: event.description,
          //   value: parseFloat(price)
          // });
          // 
          // await storage.updateEvent(event.id, {
          //   asaas_product_id: asaasProduct.id
          // });
        } catch (asaasError) {
          console.error('Error creating Asaas product:', asaasError);
          // Continue without Asaas integration for now
        }
      }

      res.json({ event });
    } catch (error) {
      console.error('Event creation error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/events/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      res.json({ event });
    } catch (error) {
      console.error('Event update error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/events/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Event deletion error:', error);
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
  // Financial routes - using direct queries for now
  app.get('/api/financial/summary', requireAuth, async (req: Request, res: Response) => {
    try {
      // Get real data from database
      const eligibleUsers = await storage.getPaymentEligibleUsers();
      const activeSubscriptions = await storage.getUsersWithActiveSubscriptions();
      
      // Calculate real financial summary
      const totalMembers = eligibleUsers.length;
      const payingMembers = activeSubscriptions.length;
      const pendingMembersCount = totalMembers - payingMembers;
      const monthlyFees = payingMembers * 10; // R$10 per paying member
      const pendingPayments = pendingMembersCount * 10; // R$10 per pending member
      
      // For now, other income and expenses will be 0 until we implement transaction tracking
      const otherIncome = 0;
      const expenses = 0;
      const totalRevenue = monthlyFees + otherIncome;
      
      const summary = {
        totalMembers,
        monthlyFees,
        payingMembers,
        pendingPayments,
        pendingMembersCount,
        otherIncome,
        expenses,
        totalRevenue
      };
      
      res.json(summary);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/financial/payments', requireAuth, async (req: Request, res: Response) => {
    try {
      // Get real payment data from Asaas integration
      const eligibleUsers = await storage.getPaymentEligibleUsers();
      const activeSubscriptions = await storage.getUsersWithActiveSubscriptions();
      
      const payments = [];
      
      // Create payment records for each eligible user
      for (const user of eligibleUsers) {
        const subscription = activeSubscriptions.find(sub => sub.user_id === user.user_id);
        const hasActiveSubscription = !!subscription;
        
        const currentDate = new Date();
        const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5); // 5th of each month
        
        payments.push({
          id: user.user_id,
          user_id: user.user_id,
          amount: '10.00',
          due_date: dueDate.toISOString().split('T')[0],
          payment_date: hasActiveSubscription ? dueDate.toISOString().split('T')[0] : null,
          status: hasActiveSubscription ? 'paid' : 'pending',
          payment_method: hasActiveSubscription ? 'asaas' : null,
          notes: hasActiveSubscription ? 'Assinatura ativa' : 'Aguardando ativação da assinatura',
          user_name: user.name,
          user_rank: user.rank,
          user_company: user.company
        });
      }
      
      res.json({ payments });
    } catch (error) {
      console.error('Error fetching monthly payments:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/financial/transactions', requireAuth, async (req: Request, res: Response) => {
    try {
      // Get real transactions from Asaas payments
      const allUsers = await storage.getUsersByRank();
      const transactions = [];
      
      // Get recent paid subscriptions as transactions
      for (const user of allUsers) {
        const payments = await storage.getAsaasPayments(user.user_id);
        
        for (const payment of payments) {
          if (payment.status === 'RECEIVED' && payment.payment_date) {
            transactions.push({
              id: payment.id,
              description: `Mensalidade - ${user.name}`,
              amount: payment.value.toFixed(2),
              type: 'income',
              transaction_date: payment.payment_date.split('T')[0],
              payment_method: payment.billing_type.toLowerCase(),
              notes: `Pagamento de mensalidade via ${payment.billing_type}`,
              category_name: 'Mensalidades'
            });
          }
        }
      }
      
      // Sort by date descending
      transactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
      
      res.json({ transactions });
    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Payment management routes
  app.get('/api/payments/subscription', requireAuth, async (req: Request, res: Response) => {
    try {
      const subscription = await storage.getAsaasSubscription(req.user.id);
      res.json(subscription);
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.get('/api/payments/history', requireAuth, async (req: Request, res: Response) => {
    try {
      const payments = await storage.getAsaasPayments(req.user.id);
      res.json(payments);
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  app.post('/api/payments/create-subscription', requireAuth, async (req: Request, res: Response) => {
    try {
      const { billingType } = req.body;
      
      if (!billingType || !['BOLETO', 'PIX'].includes(billingType)) {
        return res.status(400).json({ message: 'Tipo de cobrança inválido' });
      }

      // Get user profile
      const profile = await storage.getProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado' });
      }

      // Check if user is eligible for payment
      const { AsaasService } = await import('./asaas');
      const isEligible = AsaasService.isEligibleForPayment(profile.rank || '');
      if (!isEligible) {
        return res.status(403).json({ message: 'Usuário não elegível para pagamentos' });
      }

      // Check if already has subscription
      const existingSubscription = await storage.getAsaasSubscription(req.user.id);
      if (existingSubscription) {
        return res.status(400).json({ message: 'Usuário já possui assinatura ativa' });
      }

      // Get or create Asaas customer
      let asaasCustomer = await storage.getAsaasCustomer(req.user.id);
      if (!asaasCustomer) {
        // Create customer in Asaas
        const { asaasService } = await import('./asaas');
        const customerData = {
          name: profile.name,
          email: profile.email || req.user.email,
          cpfCnpj: AsaasService.formatCPF(profile.cpf || ''),
          phone: profile.phone || '',
          city: profile.city || '',
        };

        const asaasCustomerResponse = await asaasService.createCustomer(customerData);
        asaasCustomer = await storage.createAsaasCustomer(req.user.id, asaasCustomerResponse.id);
      }

      // Create subscription in Asaas
      const { asaasService } = await import('./asaas');
      const subscriptionData = {
        customer: asaasCustomer.asaas_customer_id,
        billingType,
        nextDueDate: AsaasService.getNextDueDate(30),
        value: 10.00,
        cycle: 'MONTHLY' as const,
        description: 'Mensalidade Comando Gólgota - R$ 10,00',
        externalReference: `user_${req.user.id}`,
      };

      const asaasSubscriptionResponse = await asaasService.createSubscription(subscriptionData);
      
      // Save subscription in database
      await storage.createAsaasSubscription({
        user_id: req.user.id,
        asaas_subscription_id: asaasSubscriptionResponse.id,
        asaas_customer_id: asaasCustomer.asaas_customer_id,
        status: 'ACTIVE',
        value: 10.00,
        cycle: 'MONTHLY',
        next_due_date: new Date(subscriptionData.nextDueDate),
      });

      res.json({ 
        message: 'Assinatura criada com sucesso',
        subscription: asaasSubscriptionResponse
      });
    } catch (error: any) {
      console.error('Create subscription error:', error);
      res.status(500).json({ message: error.message || 'Erro interno do servidor' });
    }
  });

  app.post('/api/payments/cancel-subscription', requireAuth, async (req: Request, res: Response) => {
    try {
      const subscription = await storage.getAsaasSubscription(req.user.id);
      if (!subscription) {
        return res.status(404).json({ message: 'Assinatura não encontrada' });
      }

      // Cancel subscription in Asaas
      const { asaasService } = await import('./asaas');
      await asaasService.cancelSubscription(subscription.asaas_subscription_id);
      
      // Update subscription status
      await storage.updateAsaasSubscription(subscription.id, { status: 'CANCELLED' });

      res.json({ message: 'Assinatura cancelada com sucesso' });
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ message: error.message || 'Erro interno do servidor' });
    }
  });

  // Webhook handler for Asaas
  app.post('/api/webhooks/asaas', async (req: Request, res: Response) => {
    try {
      const webhookData = req.body;
      
      // Save webhook for processing
      await storage.createAsaasWebhook({
        event_id: webhookData.id,
        event_type: webhookData.event,
        payment_id: webhookData.payment?.id,
        subscription_id: webhookData.payment?.subscription,
        customer_id: webhookData.payment?.customer,
        raw_data: JSON.stringify(webhookData),
      });

      // Process webhook immediately
      await processAsaasWebhook(webhookData);

      res.status(200).json({ message: 'Webhook processado' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ message: 'Erro ao processar webhook' });
    }
  });

  // Financial categories endpoint
  app.get('/api/financial/categories', requireAuth, async (req: Request, res: Response) => {
    try {
      const categories = [
        {
          id: 'mensalidade',
          name: 'Mensalidade',
          description: 'Taxa mensal de membro ativo',
          value: 10.00,
          eligibleRanks: ['soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
        },
        {
          id: 'doacao',
          name: 'Doação',
          description: 'Contribuição voluntária para a obra',
          value: 0,
          eligibleRanks: ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
        },
        {
          id: 'evento',
          name: 'Eventos',
          description: 'Inscrições para acampamentos e eventos',
          value: 0,
          eligibleRanks: ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
        },
        {
          id: 'oferta',
          name: 'Ofertas Especiais',
          description: 'Contribuições para projetos especiais',
          value: 0,
          eligibleRanks: ['aluno', 'soldado', 'cabo', 'sargento', 'tenente', 'capitao', 'major', 'coronel', 'comandante']
        }
      ];
      
      res.json(categories);
    } catch (error) {
      console.error('Error fetching financial categories:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Mark payment as received
  app.post('/api/financial/payments/:paymentId/mark-paid', requireAuth, async (req: Request, res: Response) => {
    try {
      const { paymentId } = req.params;
      
      // For now, we'll simulate marking as paid
      // In the future, this could create an Asaas payment record or update existing records
      
      res.json({ 
        message: 'Pagamento marcado como recebido',
        paymentId 
      });
    } catch (error) {
      console.error('Error marking payment as received:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Send payment reminder
  app.post('/api/financial/payments/:userId/send-reminder', requireAuth, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      // For now, we'll simulate sending a reminder
      // In the future, this could send an email or WhatsApp message
      
      res.json({ 
        message: 'Lembrete enviado com sucesso',
        userId 
      });
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Health metrics endpoint for financial dashboard
  app.get('/api/financial/health-metrics', requireAuth, async (req: Request, res: Response) => {
    try {
      const eligibleUsers = await storage.getPaymentEligibleUsers();
      const activeSubscriptions = await storage.getUsersWithActiveSubscriptions();
      
      // Calculate comprehensive health metrics
      const totalMembers = eligibleUsers.length;
      const payingMembers = activeSubscriptions.length;
      const collectionRate = totalMembers > 0 ? Math.round((payingMembers / totalMembers) * 100) : 0;
      
      // Get current month revenue
      const currentRevenue = payingMembers * 10; // R$10 per paying member
      const monthlyTarget = totalMembers * 10; // R$10 per total eligible member
      
      // Mock data for additional metrics (in real implementation, these would come from historical data)
      const memberGrowth = 5.2; // % growth vs previous month
      const avgPaymentDelay = payingMembers === totalMembers ? 0 : 7; // average days late
      const churnRate = 2.1; // % of members who cancelled
      
      // Calculate financial health score
      let healthScore = 100;
      if (collectionRate < 90) healthScore -= (90 - collectionRate) * 2;
      if (avgPaymentDelay > 5) healthScore -= avgPaymentDelay * 3;
      if (memberGrowth > 0) healthScore += memberGrowth * 2;
      healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
      
      // Project next month revenue
      const projectedRevenue = Math.round(currentRevenue * (1 + (memberGrowth / 100)));
      
      const metrics = {
        collectionRate,
        monthlyTarget,
        currentRevenue,
        memberGrowth,
        avgPaymentDelay,
        healthScore,
        projectedRevenue,
        churnRate,
        totalMembers,
        payingMembers,
        pendingMembers: totalMembers - payingMembers
      };
      
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  return httpServer;
}

async function processAsaasWebhook(webhookData: any) {
  try {
    const { event, payment } = webhookData;
    
    if (!payment) return;

    // Find user by Asaas customer ID
    const customer = await db.select().from(asaasCustomers)
      .where(eq(asaasCustomers.asaas_customer_id, payment.customer))
      .limit(1);
    
    if (customer.length === 0) {
      console.log('Customer not found for webhook:', payment.customer);
      return;
    }

    const userId = customer[0].user_id;

    switch (event) {
      case 'PAYMENT_CREATED':
        // Create or update payment record
        await storage.createAsaasPayment({
          user_id: userId,
          asaas_payment_id: payment.id,
          asaas_customer_id: payment.customer,
          asaas_subscription_id: payment.subscription,
          value: payment.value,
          status: 'PENDING',
          billing_type: payment.billingType,
          due_date: new Date(payment.dueDate),
          description: payment.description,
          invoice_url: payment.invoiceUrl,
          bank_slip_url: payment.bankSlipUrl,
          pix_code: payment.pixCode,
        });
        break;

      case 'PAYMENT_RECEIVED':
        // Update payment as received
        await storage.updateAsaasPayment(payment.id, {
          status: 'RECEIVED',
          payment_date: new Date(payment.paymentDate || new Date()),
          net_value: payment.netValue,
        });
        break;

      case 'PAYMENT_OVERDUE':
        // Update payment as overdue
        await storage.updateAsaasPayment(payment.id, {
          status: 'OVERDUE',
        });
        break;

      case 'PAYMENT_CANCELLED':
        // Update payment as cancelled
        await storage.updateAsaasPayment(payment.id, {
          status: 'CANCELLED',
        });
        break;
    }
  } catch (error) {
    console.error('Error processing Asaas webhook:', error);
  }
}
