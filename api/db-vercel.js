import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, and, sql } from 'drizzle-orm';
import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';
import crypto from 'crypto';

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
  user_id: uuid('user_id').references(() => users.id).notNull(),
  channel: text('channel').notNull(),
  content: text('content').notNull(),
  parent_message_id: uuid('parent_message_id'),
  thread_id: uuid('thread_id'),
  reply_count: integer('reply_count').default(0),
  is_thread_starter: boolean('is_thread_starter').default(false),
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

const company_members = pgTable('company_members', {
  id: uuid('id').primaryKey(),
  company_id: uuid('company_id').references(() => companies.id).notNull(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').default('Membro'),
  joined_at: timestamp('joined_at').defaultNow(),
  created_at: timestamp('created_at').defaultNow()
});

const events = pgTable('events', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  category: text('category').notNull(), 
  start_date: text('start_date').notNull(),
  end_date: text('end_date').notNull(),
  location: text('location').notNull(),
  duration: text('duration'),
  max_participants: integer('max_participants').default(50),
  registered_participants: integer('registered_participants').default(0),
  status: text('status').default('planning'),
  description: text('description'),
  price: text('price').default('0.00'),
  requirements: text('requirements'),
  objectives: text('objectives'),
  instructor: text('instructor'),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
});

const event_registrations = pgTable('event_registrations', {
  id: uuid('id').primaryKey(),
  event_id: uuid('event_id').references(() => events.id).notNull(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  payment_status: text('payment_status').default('pending'),
  payment_id: text('payment_id'),
  registered_at: timestamp('registered_at').defaultNow(),
  payment_data: text('payment_data')
});

// Configuração do banco para Vercel
const neonSql = neon(process.env.DATABASE_URL);
const db = drizzle(neonSql, { 
  logger: process.env.NODE_ENV === 'development' 
});

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

  async getUserByCpf(cpf) {
    try {
      const result = await db.select({
        id: users.id,
        email: users.email,
        password: users.password,
        created_at: users.created_at,
        force_password_change: users.force_password_change
      }).from(users)
      .innerJoin(profiles, eq(users.id, profiles.user_id))
      .where(eq(profiles.cpf, cpf.replace(/\D/g, '')))
      .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('Error getting user by CPF:', error);
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
      console.log('🔍 PRODUCTION ADMIN FIX - Buscando roles para usuário:', userId);
      
      // Buscar o usuário para verificar o email
      const user = await this.getUser(userId);
      console.log('👤 Usuário encontrado:', user?.email);
      
      // Buscar o perfil também para redundância 
      const profile = await this.getUserProfile(userId);
      console.log('👤 Profile encontrado:', profile?.email);
      
      // CRITICAL ADMIN FIX: Carlos Henrique é admin - verificar tanto user quanto profile
      if ((user?.email === 'chpsalgado@hotmail.com') || 
          (profile?.email === 'chpsalgado@hotmail.com') ||
          (profile?.cpf === '05018022310')) {
        console.log('✅ ADMIN AUTORIZADO: Carlos Henrique - ROLES: [ admin ]');
        return ['admin'];
      }
      
      // Todos os outros usuários são apenas 'user'
      console.log('✅ Usuário padrão (sem permissões de admin) - ROLES: [ user ]');
      return ['user'];
      
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
      
      // Buscar mensagens reais da tabela general_messages com threading
      const result = await db
        .select({
          id: general_messages.id,
          user_id: general_messages.user_id,
          channel: general_messages.channel,
          content: general_messages.content,
          parent_message_id: general_messages.parent_message_id,
          thread_id: general_messages.thread_id,
          reply_count: general_messages.reply_count,
          is_thread_starter: general_messages.is_thread_starter,
          created_at: general_messages.created_at
        })
        .from(general_messages)
        .where(eq(general_messages.channel, channel))
        .orderBy(desc(general_messages.created_at))
        .limit(100);
      
      // Buscar perfis dos autores das mensagens
      const messagesWithAuthors = [];
      for (const message of result) {
        const authorProfile = await this.getUserProfile(message.user_id);
        messagesWithAuthors.push({
          ...message,
          author_name: authorProfile?.name || 'Usuário',
          author_rank: authorProfile?.rank || 'aluno',
          author_company: authorProfile?.company || 'N/A',
          author_avatar: authorProfile?.avatar_url || null
        });
      }
      
      console.log(`✅ Encontradas ${messagesWithAuthors.length} mensagens reais`);
      return messagesWithAuthors;
    } catch (error) {
      console.error('Error getting channel messages:', error);
      return [];
    }
  }

  async createMessage(userId, channel, messageContent, parentMessageId = null, threadId = null) {
    try {
      console.log(`🔍 Criando mensagem no canal: ${channel}`);
      
      // If this is a reply, determine thread_id and update parent reply count
      let finalThreadId = threadId;
      let isThreadStarter = false;
      
      if (parentMessageId) {
        // This is a reply
        const parentMessage = await db
          .select()
          .from(general_messages)
          .where(eq(general_messages.id, parentMessageId))
          .limit(1);
          
        if (parentMessage[0]) {
          // Use parent's thread_id if it exists, otherwise use parent's id as thread_id
          finalThreadId = parentMessage[0].thread_id || parentMessage[0].id;
          
          // Update parent message reply count
          await db
            .update(general_messages)
            .set({ 
              reply_count: sql`${general_messages.reply_count} + 1`,
              is_thread_starter: true // Mark parent as thread starter
            })
            .where(eq(general_messages.id, parentMessageId));
        }
      }
      
      // Inserir mensagem real na tabela general_messages com threading
      const messageData = {
        id: crypto.randomUUID(),
        user_id: userId,
        channel: channel,
        content: messageContent,
        parent_message_id: parentMessageId,
        thread_id: finalThreadId,
        reply_count: 0,
        is_thread_starter: isThreadStarter,
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
        id: crypto.randomUUID(),
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

  async createAsaasPayment(data) {
    console.log('💳 Criando pagamento Asaas:', data);
    
    try {
      const payment = await db.insert(asaas_payments).values({
        user_id: data.user_id,
        asaas_payment_id: data.asaas_payment_id,
        value: data.value,
        status: data.status || 'PENDING',
        billing_type: data.billing_type,
        due_date: data.due_date,
        description: data.description
      }).returning();
      
      console.log('✅ Pagamento Asaas criado:', payment[0]);
      return payment[0];
    } catch (error) {
      console.error('❌ Erro ao criar pagamento Asaas:', error);
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
      
      const companyId = crypto.randomUUID();
      
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

  async addCompanyMember(companyId, userId, role = 'Membro') {
    try {
      console.log(`🔍 Adicionando membro ${userId} à empresa ${companyId} com role ${role}`);
      
      // Verificar se já é membro
      const existingMember = await db
        .select()
        .from(company_members)
        .where(
          and(
            eq(company_members.company_id, companyId),
            eq(company_members.user_id, userId)
          )
        )
        .limit(1);
      
      if (existingMember.length > 0) {
        console.log('⚠️ Usuário já é membro desta companhia');
        return true;
      }
      
      // Adicionar membro
      await db
        .insert(company_members)
        .values({
          id: crypto.randomUUID(),
          company_id: companyId,
          user_id: userId,
          role: role,
          joined_at: new Date(),
          created_at: new Date()
        });
      
      console.log('✅ Membro adicionado à companhia');
      return true;
    } catch (error) {
      console.error('❌ Error adding company member:', error);
      return false; // Não falhar o cadastro se não conseguir adicionar à companhia
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
      console.log('🔍 Buscando eventos no banco...');
      
      const result = await db
        .select()
        .from(events)
        .orderBy(desc(events.created_at));
      
      console.log(`✅ Retornando ${result.length} eventos do banco`);
      return result;
    } catch (error) {
      console.error('❌ Erro ao buscar eventos:', error);
      return [];
    }
  }

  async createEvent(eventData) {
    try {
      console.log('🔍 Criando evento no banco de dados...');
      console.log('📋 Dados do evento:', JSON.stringify(eventData, null, 2));
      
      const eventToInsert = {
        id: crypto.randomUUID(),
        name: eventData.name || eventData.title,
        type: eventData.type || 'training',
        category: eventData.category || 'rally',
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        location: eventData.location,
        duration: eventData.duration || null,
        max_participants: eventData.max_participants || 50,
        registered_participants: 0,
        status: eventData.status || 'planning',
        description: eventData.description || null,
        price: eventData.price || '0.00',
        requirements: eventData.requirements || null,
        objectives: eventData.objectives || null,
        instructor: eventData.instructor || null,
        created_by: eventData.created_by || null,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      console.log('📝 Inserindo evento:', JSON.stringify(eventToInsert, null, 2));
      
      const result = await db
        .insert(events)
        .values(eventToInsert)
        .returning();
      
      console.log('✅ Evento criado no banco:', JSON.stringify(result[0], null, 2));
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao criar evento:', error);
      throw new Error(`Falha ao criar evento: ${error.message}`);
    }
  }

  async updateEvent(eventId, data) {
    try {
      console.log(`🔍 Atualizando evento: ${eventId}`);
      console.log('📝 Dados para atualização:', JSON.stringify(data, null, 2));
      
      const updateData = {
        ...data,
        updated_at: new Date()
      };
      
      const result = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, eventId))
        .returning();
      
      console.log('✅ Evento atualizado no banco:', JSON.stringify(result[0], null, 2));
      return result[0];
    } catch (error) {
      console.error('❌ Erro ao atualizar evento:', error);
      throw new Error(`Falha ao atualizar evento: ${error.message}`);
    }
  }

  async deleteEvent(eventId) {
    try {
      console.log(`🔍 Deletando evento: ${eventId}`);
      
      // Primeiro deletar registros relacionados
      await db
        .delete(event_registrations)
        .where(eq(event_registrations.event_id, eventId));
      
      // Depois deletar o evento
      const result = await db
        .delete(events)
        .where(eq(events.id, eventId))
        .returning();
      
      console.log('✅ Evento deletado do banco:', eventId);
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar evento:', error);
      throw new Error(`Falha ao deletar evento: ${error.message}`);
    }
  }

  async registerForEvent(eventId, userId, paymentData) {
    try {
      console.log(`🔍 Registrando usuário ${userId} no evento ${eventId}`);
      
      // Por enquanto simular registro
      const registration = {
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
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
    console.log('🔍 CRIANDO USUÁRIO COMPLETO - Usuário + Perfil...');
    console.log('📋 Dados recebidos:', JSON.stringify(userData, null, 2));
    
    try {
      // ETAPA 1: Criar usuário básico na tabela users
      console.log('📝 ETAPA 1: Inserindo usuário básico na tabela users...');
      
      const userToInsert = {
        id: userData.id,
        email: userData.email,
        password: userData.password,
        created_at: new Date(),
        force_password_change: false
      };
      
      console.log('📝 Dados do usuário:', JSON.stringify(userToInsert, null, 2));
      
      const userResult = await db
        .insert(users)
        .values(userToInsert)
        .returning();
      
      console.log('✅ ETAPA 1 CONCLUÍDA: Usuário básico criado:', JSON.stringify(userResult[0], null, 2));
      
      // ETAPA 2: Criar perfil do usuário na tabela profiles
      console.log('📝 ETAPA 2: Criando perfil do usuário...');
      
      const profileData = {
        id: crypto.randomUUID(),
        user_id: userData.id,
        name: userData.name || userData.email.split('@')[0],
        cpf: userData.cpf || '',
        phone: userData.phone || '',
        address: userData.address || '',
        city: userData.city || '',
        birth_date: userData.birth_date || null,
        rank: userData.rank || 'aluno',
        company: userData.company || '',
        email: userData.email,
        bio: null,
        avatar_url: null,
        specialties: null,
        joined_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      console.log('📝 Dados do perfil:', JSON.stringify(profileData, null, 2));
      
      const profileResult = await db
        .insert(profiles)
        .values(profileData)
        .returning();
      
      console.log('✅ ETAPA 2 CONCLUÍDA: Perfil criado:', JSON.stringify(profileResult[0], null, 2));
      
      // ETAPA 3: Adicionar à companhia se especificada
      if (userData.company) {
        try {
          console.log('🏢 ETAPA 3: Tentando adicionar à companhia...');
          const companies = await this.getCompanies();
          const company = companies.find(c => c.name.toLowerCase().includes(userData.company.toLowerCase()));
          
          if (company) {
            console.log(`🏢 Companhia encontrada: ${company.name}`);
            await this.addCompanyMember(company.id, userData.id, 'Membro');
            console.log('✅ ETAPA 3 CONCLUÍDA: Usuário adicionado à companhia');
          } else {
            console.log(`⚠️ Companhia "${userData.company}" não encontrada, pulando...`);
          }
        } catch (companyError) {
          console.log('⚠️ Erro ao adicionar à companhia (não crítico):', companyError.message);
        }
      }
      
      console.log('🎉 PROCESSO COMPLETO: Usuário + Perfil criados com sucesso!');
      
      return userResult[0];
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO na criação do usuário:');
      console.error('❌ Nome:', error.name);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Código:', error.code);
      console.error('❌ Stack:', error.stack);
      
      if (error.code) {
        console.error('❌ Código específico do DB:', error.code);
      }
      
      if (error.constraint) {
        console.error('❌ Constraint violada:', error.constraint);
      }
      
      throw new Error(`Falha na criação do usuário: ${error.message}`);
    }
  }

  // Função separada para criar perfil (usaremos depois)
  async createUserProfile(userId, profileData) {
    try {
      console.log('📝 Criando perfil para usuário:', userId);
      
      const profile = {
        id: crypto.randomUUID(),
        user_id: userId,
        name: profileData.name || '',
        cpf: profileData.cpf || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        birth_date: profileData.birth_date || null,
        rank: profileData.rank || 'aluno',
        company: profileData.company || '',
        email: profileData.email || '',
        bio: null,
        avatar_url: null,
        specialties: null,
        joined_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      };
      
      await db.insert(profiles).values(profile);
      console.log('✅ Perfil criado com sucesso');
      return profile;
      
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
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
      console.log('📝 Atualizando perfil no DB:', { userId, data });
      
      // Convert data properties to match database columns
      const updateData = { ...data };
      if (data.birth_date) {
        updateData.birth_date = data.birth_date;
      }
      
      // Update the profile record in database
      const result = await db.update(profiles)
        .set({
          ...updateData,
          updated_at: new Date()
        })
        .where(eq(profiles.user_id, userId))
        .returning();
        
      if (result.length === 0) {
        throw new Error('Perfil não encontrado para atualização');
      }
      
      // Get the updated profile with user data for consistency
      const updatedProfile = await this.getUserProfile(userId);
      
      console.log('✅ Perfil atualizado no banco:', updatedProfile?.name);
      return updatedProfile;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
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
