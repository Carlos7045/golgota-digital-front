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
}