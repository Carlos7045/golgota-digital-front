import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

// Schema inline para evitar problemas de importação
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  force_password_change: boolean('force_password_change').default(false)
});

const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  cpf: text('cpf').unique().notNull(),
  birth_date: text('birth_date'),
  phone: text('phone'),
  address: text('address'),
  city: text('city'),
  rank: text('rank').notNull().default('aluno'),
  company: text('company'),
  avatar_url: text('avatar_url'),
  email: text('email'),
  bio: text('bio'),
  specialties: text('specialties').array(),
  joined_at: timestamp('joined_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

const user_roles = pgTable('user_roles', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').notNull(),
  created_at: timestamp('created_at').defaultNow()
});

const general_messages = pgTable('general_messages', {
  id: uuid('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  author_id: uuid('author_id').references(() => users.id).notNull(),
  author_name: text('author_name').notNull(),
  author_rank: text('author_rank').notNull(),
  author_company: text('author_company').notNull(),
  views: integer('views').default(0),
  interactions: integer('interactions').default(0),
  created_at: timestamp('created_at').defaultNow()
});

const companies = pgTable('companies', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  commander_id: uuid('commander_id').references(() => users.id),
  sub_commander_id: uuid('sub_commander_id').references(() => users.id),
  status: text('status').default('Planejamento'),
  description: text('description'),
  city: text('city'),
  state: text('state'),
  founded_date: timestamp('founded_date'),
  color: text('color'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

const asaas_subscriptions = pgTable('asaas_subscriptions', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  asaas_subscription_id: text('asaas_subscription_id').unique().notNull(),
  asaas_customer_id: text('asaas_customer_id').notNull(),
  status: text('status').notNull(),
  value: text('value').notNull(),
  cycle: text('cycle').notNull(),
  next_due_date: timestamp('next_due_date'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

const asaas_payments = pgTable('asaas_payments', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  asaas_payment_id: text('asaas_payment_id').unique().notNull(),
  subscription_id: uuid('subscription_id').references(() => asaas_subscriptions.id),
  value: text('value').notNull(),
  net_value: text('net_value'),
  status: text('status').notNull(),
  billing_type: text('billing_type').notNull(),
  due_date: timestamp('due_date'),
  payment_date: timestamp('payment_date'),
  description: text('description'),
  invoice_url: text('invoice_url'),
  bank_slip_url: text('bank_slip_url'),
  pix_code: text('pix_code'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

// Configuração do banco para Vercel
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

export class VercelStorage {
  async getUserByEmail(email) {
    try {
      const result = await db.select({
        id: users.id,
        email: users.email,
        password: users.password,
        created_at: users.created_at,
        force_password_change: users.force_password_change
      }).from(users).where(eq(users.email, email)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async getUser(id) {
    try {
      const result = await db.select({
        id: users.id,
        email: users.email,
        password: users.password,
        created_at: users.created_at,
        force_password_change: users.force_password_change
      }).from(users).where(eq(users.id, id)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async getUserProfile(userId) {
    try {
      const result = await db
        .select()
        .from(profiles)
        .where(eq(profiles.user_id, userId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async getUsersByRank() {
    try {
      const result = await db
        .select({
          user_id: profiles.user_id,
          cpf: profiles.cpf,
          rank: profiles.rank,
          name: profiles.name
        })
        .from(profiles);
      return result;
    } catch (error) {
      console.error('Error getting users by rank:', error);
      return [];
    }
  }

  async getUserRoles(userId) {
    try {
      console.log('🔍 Buscando roles para usuário:', userId);
      
      const result = await db
        .select({
          role: user_roles.role
        })
        .from(user_roles)
        .where(eq(user_roles.user_id, userId));
      
      const roles = result.map(r => r.role);
      console.log('✅ Roles encontrados:', roles);
      
      // Se não tem roles definidos, usar roles padrão baseado no rank
      if (roles.length === 0) {
        const profile = await this.getUserProfile(userId);
        if (profile?.rank === 'comandante' || profile?.rank === 'major' || profile?.rank === 'coronel') {
          roles.push('admin');
        }
        roles.push('user');
      }
      
      return roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      return ['user']; // Role padrão em caso de erro
    }
  }

  // Método para buscar todos os perfis com detalhes dos usuários
  async getAllProfiles() {
    try {
      console.log('🔍 Buscando todos os perfis...');
      
      const result = await db
        .select({
          id: profiles.id,
          user_id: profiles.user_id,
          name: profiles.name,
          cpf: profiles.cpf,
          birth_date: profiles.birth_date,
          phone: profiles.phone,
          address: profiles.address,
          city: profiles.city,
          rank: profiles.rank,
          company: profiles.company,
          avatar_url: profiles.avatar_url,
          email: profiles.email,
          bio: profiles.bio,
          specialties: profiles.specialties,
          joined_at: profiles.joined_at,
          created_at: profiles.created_at,
          updated_at: profiles.updated_at
        })
        .from(profiles);
      
      console.log(`✅ Encontrados ${result.length} perfis`);
      return result;
    } catch (error) {
      console.error('Error getting all profiles:', error);
      return [];
    }
  }

  // Método para buscar usuários com perfis (join)
  async getUsersWithProfiles() {
    try {
      console.log('🔍 Buscando usuários com perfis...');
      
      // Primeiro buscar todos os usuários
      const usersResult = await db
        .select({
          id: users.id,
          email: users.email,
          created_at: users.created_at,
          force_password_change: users.force_password_change
        })
        .from(users);
      
      // Depois buscar perfis para cada usuário
      const usersWithProfiles = [];
      for (const user of usersResult) {
        const profile = await this.getUserProfile(user.id);
        if (profile) {
          usersWithProfiles.push({
            ...user,
            profile: profile
          });
        }
      }
      
      console.log(`✅ Encontrados ${usersWithProfiles.length} usuários com perfis`);
      return usersWithProfiles;
    } catch (error) {
      console.error('Error getting users with profiles:', error);
      return [];
    }
  }

  // === MÉTODOS PARA MENSAGENS ===
  async getChannelMessages(channel) {
    try {
      console.log(`🔍 Buscando mensagens do canal: ${channel}`);
      
      // Buscar mensagens reais da tabela general_messages
      const result = await db
        .select({
          id: general_messages.id,
          title: general_messages.title,
          body: general_messages.body,
          author_id: general_messages.author_id,
          created_at: general_messages.created_at,
          views: general_messages.views,
          interactions: general_messages.interactions,
          author_name: general_messages.author_name,
          author_rank: general_messages.author_rank,
          author_company: general_messages.author_company
        })
        .from(general_messages)
        .orderBy(desc(general_messages.created_at))
        .limit(50);
      
      console.log(`✅ Encontradas ${result.length} mensagens reais`);
      return result;
    } catch (error) {
      console.error('Error getting channel messages:', error);
      // Se tabela não existir, retornar array vazio
      return [];
    }
  }

  async createMessage(userId, channel, messageContent) {
    try {
      console.log(`🔍 Criando mensagem no canal: ${channel}`);
      
      // Buscar dados do autor
      const authorProfile = await this.getUserProfile(userId);
      if (!authorProfile) {
        throw new Error('Perfil do autor não encontrado');
      }
      
      // Inserir mensagem real na tabela general_messages
      const messageData = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'Mensagem no Canal Geral',
        body: messageContent,
        author_id: userId,
        author_name: authorProfile.name,
        author_rank: authorProfile.rank || 'aluno',
        author_company: authorProfile.company || 'N/A',
        views: 0,
        interactions: 0,
        created_at: new Date()
      };
      
      const result = await db
        .insert(general_messages)
        .values(messageData)
        .returning();
      
      console.log('✅ Mensagem criada com sucesso na base de dados');
      return result[0];
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  }

  // === MÉTODOS PARA ASAAS (PAGAMENTOS) ===
  async getAsaasSubscription(userId) {
    try {
      console.log(`🔍 Buscando assinatura Asaas para usuário: ${userId}`);
      
      // Buscar assinatura real na tabela asaas_subscriptions
      const result = await db
        .select()
        .from(asaas_subscriptions)
        .where(eq(asaas_subscriptions.user_id, userId))
        .limit(1);
      
      console.log('✅ Assinatura encontrada:', result[0] ? 'Sim' : 'Não');
      return result[0] || null;
    } catch (error) {
      console.error('Error getting asaas subscription:', error);
      return null;
    }
  }

  async getAsaasPayments(userId) {
    try {
      console.log(`🔍 Buscando pagamentos Asaas para usuário: ${userId}`);
      
      // Buscar pagamentos reais na tabela asaas_payments
      const result = await db
        .select()
        .from(asaas_payments)
        .where(eq(asaas_payments.user_id, userId))
        .orderBy(desc(asaas_payments.created_at));
      
      console.log(`✅ Encontrados ${result.length} pagamentos reais`);
      return result;
    } catch (error) {
      console.error('Error getting asaas payments:', error);
      return [];
    }
  }

  async createAsaasSubscription(data) {
    try {
      console.log('🔍 Criando assinatura Asaas...');
      
      // Por enquanto simular criação
      const subscription = {
        id: Date.now().toString(),
        ...data,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Assinatura criada (simulada)');
      return subscription;
    } catch (error) {
      console.error('Error creating asaas subscription:', error);
      throw error;
    }
  }

  async updateAsaasSubscription(subscriptionId, data) {
    try {
      console.log(`🔍 Atualizando assinatura: ${subscriptionId}`);
      
      // Por enquanto simular atualização
      console.log('✅ Assinatura atualizada (simulada)');
      return { success: true };
    } catch (error) {
      console.error('Error updating asaas subscription:', error);
      throw error;
    }
  }

  // === MÉTODOS PARA EMPRESAS ===
  async getCompanies() {
    try {
      console.log('🔍 Buscando empresas...');
      
      // Buscar empresas reais da tabela companies
      const result = await db
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
          updated_at: companies.updated_at
        })
        .from(companies);
      
      console.log(`✅ Encontradas ${result.length} empresas reais`);
      return result;
    } catch (error) {
      console.error('Error getting companies:', error);
      return [];
    }
  }

  async createCompany(companyData) {
    try {
      console.log('🔍 Criando empresa...');
      
      const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Inserir empresa real na tabela companies
      const result = await db
        .insert(companies)
        .values({
          id: companyId,
          name: companyData.name,
          commander_id: companyData.commander_id,
          sub_commander_id: companyData.sub_commander_id,
          description: companyData.description,
          city: companyData.city,
          state: companyData.state,
          color: companyData.color || '#FFD700',
          status: companyData.status || 'Planejamento',
          founded_date: companyData.founded_date ? new Date(companyData.founded_date) : new Date(),
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      
      console.log('✅ Empresa criada na base de dados');
      return result[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(companyId, data) {
    try {
      console.log(`🔍 Atualizando empresa: ${companyId}`);
      
      const result = await db
        .update(companies)
        .set({
          ...data,
          updated_at: new Date()
        })
        .where(eq(companies.id, companyId))
        .returning();
      
      console.log('✅ Empresa atualizada na base de dados');
      return result[0];
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  }

  async deleteCompany(companyId) {
    try {
      console.log(`🔍 Deletando empresa: ${companyId}`);
      
      await db
        .delete(companies)
        .where(eq(companies.id, companyId));
      
      console.log('✅ Empresa deletada da base de dados');
      return true;
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }

  async getCompanyMembers(companyId) {
    try {
      console.log(`🔍 Buscando membros da empresa: ${companyId}`);
      
      // Por enquanto retornar array vazio
      // Em um sistema real, faria join com tabela company_members
      return [];
    } catch (error) {
      console.error('Error getting company members:', error);
      return [];
    }
  }

  async addCompanyMember(companyId, userId, role) {
    try {
      console.log(`🔍 Adicionando membro ${userId} à empresa ${companyId}`);
      
      // Por enquanto simular adição
      console.log('✅ Membro adicionado (simulado)');
      return true;
    } catch (error) {
      console.error('Error adding company member:', error);
      throw error;
    }
  }

  async removeCompanyMember(companyId, userId) {
    try {
      console.log(`🔍 Removendo membro ${userId} da empresa ${companyId}`);
      
      // Por enquanto simular remoção
      console.log('✅ Membro removido (simulado)');
      return true;
    } catch (error) {
      console.error('Error removing company member:', error);
      throw error;
    }
  }

  async updateMemberRole(companyId, userId, role) {
    try {
      console.log(`🔍 Atualizando role do membro ${userId} na empresa ${companyId}`);
      
      // Por enquanto simular atualização
      console.log('✅ Role atualizada (simulada)');
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  // === MÉTODOS PARA EVENTOS ===
  async getEvents() {
    try {
      console.log('🔍 Buscando eventos...');
      
      // Por enquanto retornar array vazio até criar tabela events
      return [];
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  async createEvent(eventData) {
    try {
      console.log('🔍 Criando evento...');
      
      // Por enquanto simular criação
      const event = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...eventData,
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Evento criado (simulado)');
      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(eventId, data) {
    try {
      console.log(`🔍 Atualizando evento: ${eventId}`);
      
      // Por enquanto simular atualização
      const event = {
        id: eventId,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Evento atualizado (simulado)');
      return event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId) {
    try {
      console.log(`🔍 Deletando evento: ${eventId}`);
      
      // Por enquanto simular delete
      console.log('✅ Evento deletado (simulado)');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async registerForEvent(eventId, userId, paymentData) {
    try {
      console.log(`🔍 Registrando usuário ${userId} no evento ${eventId}`);
      
      // Por enquanto simular registro
      const registration = {
        id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        event_id: eventId,
        user_id: userId,
        payment_data: paymentData,
        created_at: new Date().toISOString()
      };
      
      console.log('✅ Registro criado (simulado)');
      return registration;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  async unregisterFromEvent(eventId, userId) {
    try {
      console.log(`🔍 Cancelando registro do usuário ${userId} no evento ${eventId}`);
      
      // Por enquanto simular cancelamento
      console.log('✅ Registro cancelado (simulado)');
      return true;
    } catch (error) {
      console.error('Error unregistering from event:', error);
      throw error;
    }
  }

  async getUserEventRegistrations(userId) {
    try {
      console.log(`🔍 Buscando registros do usuário: ${userId}`);
      
      // Por enquanto retornar array vazio
      return [];
    } catch (error) {
      console.error('Error getting user event registrations:', error);
      return [];
    }
  }

  // === MÉTODOS FINANCEIROS ===
  async getFinancialTransactions(startDate, endDate) {
    try {
      console.log(`🔍 Buscando transações financeiras entre ${startDate} e ${endDate}`);
      
      // Por enquanto retornar dados simulados
      const transactions = [
        {
          id: '1',
          description: 'Mensalidade Janeiro',
          amount: 10.00,
          type: 'income',
          category: 'Mensalidade',
          date: new Date().toISOString(),
          status: 'confirmed'
        }
      ];
      
      console.log(`✅ Retornando ${transactions.length} transações`);
      return transactions;
    } catch (error) {
      console.error('Error getting financial transactions:', error);
      return [];
    }
  }

  async getFinancialCategories() {
    try {
      console.log('🔍 Buscando categorias financeiras...');
      
      const categories = [
        { id: '1', name: 'Aluguel', type: 'expense' },
        { id: '2', name: 'Material', type: 'expense' },
        { id: '3', name: 'Alimentação', type: 'expense' },
        { id: '4', name: 'Transporte', type: 'expense' },
        { id: '5', name: 'Equipamentos', type: 'expense' },
        { id: '6', name: 'Administrativo', type: 'expense' },
        { id: '7', name: 'Mensalidade', type: 'income' },
        { id: '8', name: 'Doações', type: 'income' },
        { id: '9', name: 'Eventos', type: 'income' }
      ];
      
      console.log(`✅ Retornando ${categories.length} categorias`);
      return categories;
    } catch (error) {
      console.error('Error getting financial categories:', error);
      return [];
    }
  }

  async createFinancialTransaction(transactionData) {
    try {
      console.log('🔍 Criando transação financeira...');
      
      const transaction = {
        id: `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...transactionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Transação criada (simulada)');
      return transaction;
    } catch (error) {
      console.error('Error creating financial transaction:', error);
      throw error;
    }
  }

  async updateFinancialTransaction(transactionId, data) {
    try {
      console.log(`🔍 Atualizando transação financeira: ${transactionId}`);
      
      const transaction = {
        id: transactionId,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Transação atualizada (simulada)');
      return transaction;
    } catch (error) {
      console.error('Error updating financial transaction:', error);
      throw error;
    }
  }

  async getFinancialCategoryByName(name) {
    try {
      console.log(`🔍 Buscando categoria por nome: ${name}`);
      
      const categories = await this.getFinancialCategories();
      const category = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      
      console.log('✅ Categoria encontrada:', category ? 'Sim' : 'Não');
      return category || null;
    } catch (error) {
      console.error('Error getting financial category by name:', error);
      return null;
    }
  }

  // === MÉTODOS DE GESTÃO DE USUÁRIOS ===
  async createUser(userData) {
    try {
      console.log('🔍 Criando usuário na base de dados...');
      
      // Inserir usuário real na tabela users
      const result = await db
        .insert(users)
        .values({
          id: userData.id,
          email: userData.email,
          password: userData.password,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning();
      
      // Criar perfil associado
      await db
        .insert(profiles)
        .values({
          id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: userData.id,
          name: userData.name || userData.email.split('@')[0],
          cpf: userData.cpf,
          phone: userData.phone,
          rank: userData.rank || 'aluno',
          company: userData.company,
          created_at: new Date(),
          updated_at: new Date()
        });
      
      console.log('✅ Usuário criado na base de dados');
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      console.log(`🔍 Deletando usuário: ${userId}`);
      
      // Deletar perfil primeiro (chave estrangeira)
      await db
        .delete(profiles)
        .where(eq(profiles.user_id, userId));
      
      // Deletar usuário
      await db
        .delete(users)
        .where(eq(users.id, userId));
      
      console.log('✅ Usuário deletado da base de dados');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateProfile(userId, data) {
    try {
      console.log(`🔍 Atualizando perfil do usuário: ${userId}`);
      
      // Por enquanto retornar dados simulados
      const profile = {
        id: `profile_${userId}`,
        user_id: userId,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Perfil atualizado (simulado)');
      return profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async getAvailableCommanders() {
    try {
      console.log('🔍 Buscando comandantes disponíveis...');
      
      // Por enquanto retornar dados simulados
      const commanders = [
        {
          id: 'cmd_1',
          name: 'Carlos Henrique Pereira Salgado',
          email: 'chpsalgado@hotmail.com',
          rank: 'comandante',
          company: 'Quemuel'
        }
      ];
      
      console.log(`✅ Encontrados ${commanders.length} comandantes`);
      return commanders;
    } catch (error) {
      console.error('Error getting available commanders:', error);
      return [];
    }
  }

  async getTrainings() {
    try {
      console.log('🔍 Buscando treinamentos...');
      
      // Por enquanto retornar dados simulados
      const trainings = [
        { id: '1', name: 'Treinamento Básico', level: 'Iniciante', duration: '2 horas' },
        { id: '2', name: 'Treinamento Avançado', level: 'Avançado', duration: '4 horas' }
      ];
      
      console.log(`✅ Retornando ${trainings.length} treinamentos`);
      return trainings;
    } catch (error) {
      console.error('Error getting trainings:', error);
      return [];
    }
  }

  async getCourses() {
    try {
      console.log('🔍 Buscando cursos...');
      
      // Por enquanto retornar dados simulados
      const courses = [
        { id: '1', name: 'CPLG', category: 'Preparatório', duration: '5 dias' },
        { id: '2', name: 'FEG', category: 'Especialização', duration: '3 dias' }
      ];
      
      console.log(`✅ Retornando ${courses.length} cursos`);
      return courses;
    } catch (error) {
      console.error('Error getting courses:', error);
      return [];
    }
  }
}