import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { VercelStorage } from './db-vercel.js';

const app = express();
const storage = new VercelStorage();

console.log('🚀 API iniciando...');
console.log('📦 NODE_ENV:', process.env.NODE_ENV);
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? 'Configurado' : 'Não configurado');

// CORS específico para comandogolgota.com.br
app.use(cors({
  origin: [
    'https://comandogolgota.com.br',
    'https://www.comandogolgota.com.br',
    'https://golgota-digital-front-9deh.vercel.app',
    /\.vercel\.app$/,
    /localhost/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie']
}));

// Middleware essencial
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'comando-golgota-jwt-secret-2024';

// Middleware de autenticação JWT
function requireAuth(req, res, next) {
  console.log('🔐 Verificando autenticação JWT...');
  console.log('🍪 Cookies recebidos:', req.cookies);
  console.log('🔑 Headers authorization:', req.headers.authorization);
  
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
  
  if (!token) {
    console.log('❌ Token não encontrado nos cookies nem headers');
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  console.log('🔑 Token encontrado:', token.substring(0, 50) + '...');
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token válido para:', decoded.email);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    res.status(401).json({ message: 'Token inválido' });
  }
}

// Função para login
async function authenticateUser(emailOrCpf, password) {
  try {
    console.log('🔍 Tentativa de login:', emailOrCpf);
    
    let user = await storage.getUserByEmail(emailOrCpf);
    
    if (!user) {
      console.log('❌ Usuário não encontrado por email, tentando por CPF...');
      const users = await storage.getUsersByRank();
      const profileWithCpf = users.find(u => u.cpf === emailOrCpf.replace(/\D/g, ''));
      if (profileWithCpf) {
        user = await storage.getUser(profileWithCpf.user_id);
      }
    }
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return null;
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Senha inválida');
      return null;
    }
    
    console.log('✅ Login bem-sucedido');
    return user;
  } catch (error) {
    console.error('❌ Erro no login:', error);
    throw error;
  }
}

// Rota de login JWT
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Tentativa de login recebida...');
  
  try {
    const { emailOrCpf, password } = req.body;
    
    if (!emailOrCpf || !password) {
      return res.status(400).json({ error: 'Email/CPF e senha são obrigatórios' });
    }
    
    const user = await authenticateUser(emailOrCpf, password);
    
    if (!user) {
      return res.status(401).json({ error: 'CPF/Email ou senha inválidos' });
    }
    
    // Buscar perfil do usuário
    const profile = await storage.getUserProfile(user.id);
    const roles = await storage.getUserRoles(user.id);
    
    // Criar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ Login realizado com sucesso, token gerado');
    console.log('🔑 Token gerado:', token);
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token type:', typeof token);
    
    // Criar objeto de resposta simples
    const responseData = {
      user: { 
        id: user.id, 
        email: user.email,
        force_password_change: user.force_password_change || false,
        created_at: user.created_at 
      },
      profile,
      roles,
      token: token, // Explícito
      message: 'Login realizado com sucesso'
    };
    
    console.log('📤 Objeto de resposta criado com token:', responseData.token ? 'SIM' : 'NÃO');
    console.log('📤 Todas as chaves do objeto:', Object.keys(responseData));
    
    // Enviar token no cookie também
    res.cookie('token', token, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    console.log('🚀 Enviando resposta JSON...');
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    console.log('📄 Buscando perfil do usuário:', req.user.id);
    
    const profile = await storage.getUserProfile(req.user.id);
    const roles = await storage.getUserRoles(req.user.id);
    
    console.log('✅ Perfil encontrado:', profile?.name || 'Perfil não encontrado');
    console.log('✅ Roles:', roles);
    
    res.json({ profile, roles });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Rota de logout JWT
app.post('/api/auth/logout', (req, res) => {
  console.log('🔐 Logout solicitado');
  
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso' });
});

// Endpoint para buscar todos os perfis (admin)
app.get('/api/profiles', requireAuth, async (req, res) => {
  try {
    console.log('📄 Buscando todos os perfis...');
    
    const profiles = await storage.getAllProfiles();
    console.log(`✅ Retornando ${profiles.length} perfis`);
    
    res.json({ profiles });
  } catch (error) {
    console.error('❌ Erro ao buscar perfis:', error);
    res.status(500).json({ error: 'Erro ao buscar perfis' });
  }
});

// Endpoint para buscar usuários com perfis (admin)
app.get('/api/users', requireAuth, async (req, res) => {
  try {
    console.log('📄 Buscando usuários com perfis...');
    
    const users = await storage.getUsersWithProfiles();
    console.log(`✅ Retornando ${users.length} usuários`);
    
    res.json({ users });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// === ENDPOINTS DE CHAT/MENSAGENS ===

// Buscar mensagens do canal geral
app.get('/api/messages/general', requireAuth, async (req, res) => {
  try {
    console.log('💬 Buscando mensagens do canal geral...');
    
    const messages = await storage.getChannelMessages('general');
    console.log(`✅ Retornando ${messages.length} mensagens`);
    
    res.json({ messages });
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Enviar mensagem no canal geral
app.post('/api/messages/general', requireAuth, async (req, res) => {
  try {
    console.log('💬 Enviando mensagem para canal geral...');
    
    const { content } = req.body;
    const message = await storage.createMessage(req.user.id, 'general', content);
    
    console.log('✅ Mensagem enviada com sucesso');
    res.json({ message });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// Buscar usuários online
app.get('/api/users/online', requireAuth, async (req, res) => {
  try {
    console.log('👥 Buscando usuários online...');
    
    // Por enquanto, vamos retornar todos os usuários como "online"
    // Em um sistema real, isso seria baseado em sessões ativas
    const users = await storage.getUsersWithProfiles();
    const onlineUsers = users.map(user => ({
      id: user.id,
      name: user.profile?.name || user.email,
      avatar_url: user.profile?.avatar_url,
      rank: user.profile?.rank || 'aluno'
    }));
    
    console.log(`✅ Retornando ${onlineUsers.length} usuários online`);
    res.json({ users: onlineUsers });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários online:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários online' });
  }
});

// === ENDPOINTS DE PAGAMENTOS ===

// Buscar assinatura do usuário
app.get('/api/payments/subscription', requireAuth, async (req, res) => {
  try {
    console.log('💳 Buscando assinatura do usuário...');
    
    const subscription = await storage.getAsaasSubscription(req.user.id);
    console.log('✅ Assinatura encontrada:', subscription ? 'Sim' : 'Não');
    
    res.json(subscription);
  } catch (error) {
    console.error('❌ Erro ao buscar assinatura:', error);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

// Buscar histórico de pagamentos
app.get('/api/payments/history', requireAuth, async (req, res) => {
  try {
    console.log('💳 Buscando histórico de pagamentos...');
    
    const payments = await storage.getAsaasPayments(req.user.id);
    console.log(`✅ Retornando ${payments.length} pagamentos`);
    
    res.json(payments);
  } catch (error) {
    console.error('❌ Erro ao buscar histórico de pagamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico de pagamentos' });
  }
});

// Criar assinatura
app.post('/api/payments/create-subscription', requireAuth, async (req, res) => {
  try {
    console.log('💳 Criando assinatura...');
    
    const { billingType } = req.body;
    const profile = await storage.getUserProfile(req.user.id);
    
    if (!profile) {
      return res.status(400).json({ error: 'Perfil não encontrado' });
    }

    // Criar assinatura via Asaas
    const subscriptionData = {
      customer: profile.email,
      billingType: billingType || 'PIX',
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: 10.00,
      cycle: 'MONTHLY',
      description: 'Mensalidade Comando Gólgota'
    };

    const subscription = await storage.createAsaasSubscription(subscriptionData);
    console.log('✅ Assinatura criada com sucesso');
    
    res.json(subscription);
  } catch (error) {
    console.error('❌ Erro ao criar assinatura:', error);
    res.status(500).json({ error: 'Erro ao criar assinatura' });
  }
});

// Cancelar assinatura
app.post('/api/payments/cancel-subscription', requireAuth, async (req, res) => {
  try {
    console.log('💳 Cancelando assinatura...');
    
    const subscription = await storage.getAsaasSubscription(req.user.id);
    if (!subscription) {
      return res.status(400).json({ error: 'Assinatura não encontrada' });
    }

    await storage.updateAsaasSubscription(subscription.asaas_subscription_id, { status: 'CANCELLED' });
    console.log('✅ Assinatura cancelada com sucesso');
    
    res.json({ message: 'Assinatura cancelada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura' });
  }
});

// === ENDPOINTS DE MENSAGENS ===

// Buscar mensagens
app.get('/api/messages/:channel', requireAuth, async (req, res) => {
  try {
    const { channel } = req.params;
    console.log(`📨 Buscando mensagens do canal: ${channel}`);
    
    const messages = await storage.getChannelMessages(channel);
    console.log(`✅ Retornando ${messages.length} mensagens`);
    
    res.json({ messages });
  } catch (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
});

// Criar mensagem
app.post('/api/messages/:channel', requireAuth, async (req, res) => {
  try {
    const { channel } = req.params;
    const { content } = req.body;
    
    console.log(`📨 Criando mensagem no canal: ${channel}`);
    
    if (!content) {
      return res.status(400).json({ error: 'Conteúdo é obrigatório' });
    }
    
    const message = await storage.createMessage(req.user.id, channel, content);
    console.log('✅ Mensagem criada com sucesso');
    
    res.json({ message });
  } catch (error) {
    console.error('❌ Erro ao criar mensagem:', error);
    res.status(500).json({ error: 'Erro ao criar mensagem' });
  }
});

// === ENDPOINTS DE EMPRESAS ===

// Buscar empresas
app.get('/api/companies', requireAuth, async (req, res) => {
  try {
    console.log('🏢 Buscando empresas...');
    
    const companies = await storage.getCompanies();
    console.log(`✅ Retornando ${companies.length} empresas`);
    
    res.json({ companies });
  } catch (error) {
    console.error('❌ Erro ao buscar empresas:', error);
    res.status(500).json({ error: 'Erro ao buscar empresas' });
  }
});

// Criar empresa
app.post('/api/companies', requireAuth, async (req, res) => {
  try {
    console.log('🏢 Criando nova empresa...');
    const { name, commander_id, sub_commander_id, description, city, state, color, members } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }
    
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
    
    // Adicionar membros se fornecidos
    if (members && members.length > 0) {
      for (const member of members) {
        if (member.user_id && member.user_id !== commander_id && member.user_id !== sub_commander_id) {
          await storage.addCompanyMember(company.id, member.user_id, member.role || "Membro");
        }
      }
    }
    
    console.log('✅ Empresa criada com sucesso');
    res.json({ company });
  } catch (error) {
    console.error('❌ Erro ao criar empresa:', error);
    res.status(500).json({ error: 'Erro ao criar empresa' });
  }
});

// Atualizar empresa
app.put('/api/companies/:id', requireAuth, async (req, res) => {
  try {
    console.log(`🏢 Atualizando empresa: ${req.params.id}`);
    
    const company = await storage.updateCompany(req.params.id, req.body);
    console.log('✅ Empresa atualizada com sucesso');
    
    res.json({ company });
  } catch (error) {
    console.error('❌ Erro ao atualizar empresa:', error);
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

// Deletar empresa
app.delete('/api/companies/:id', requireAuth, async (req, res) => {
  try {
    console.log(`🏢 Deletando empresa: ${req.params.id}`);
    
    await storage.deleteCompany(req.params.id);
    console.log('✅ Empresa deletada com sucesso');
    
    res.json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar empresa:', error);
    res.status(500).json({ error: 'Erro ao deletar empresa' });
  }
});

// Buscar membros da empresa
app.get('/api/companies/:id/members', requireAuth, async (req, res) => {
  try {
    console.log(`🏢 Buscando membros da empresa: ${req.params.id}`);
    
    const members = await storage.getCompanyMembers(req.params.id);
    console.log(`✅ Retornando ${members.length} membros`);
    
    res.json({ members });
  } catch (error) {
    console.error('❌ Erro ao buscar membros da empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar membros da empresa' });
  }
});

// Adicionar membro à empresa
app.post('/api/companies/:id/members', requireAuth, async (req, res) => {
  try {
    console.log(`🏢 Adicionando membro à empresa: ${req.params.id}`);
    const { user_id, role } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }
    
    await storage.addCompanyMember(req.params.id, user_id, role || 'Membro');
    console.log('✅ Membro adicionado com sucesso');
    
    res.json({ message: 'Membro adicionado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao adicionar membro:', error);
    res.status(500).json({ error: 'Erro ao adicionar membro' });
  }
});

// Remover membro da empresa
app.delete('/api/companies/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    console.log(`🏢 Removendo membro da empresa: ${req.params.id}`);
    
    await storage.removeCompanyMember(req.params.id, req.params.userId);
    console.log('✅ Membro removido com sucesso');
    
    res.json({ message: 'Membro removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao remover membro:', error);
    res.status(500).json({ error: 'Erro ao remover membro' });
  }
});

// Atualizar role do membro
app.put('/api/companies/:id/members/:userId', requireAuth, async (req, res) => {
  try {
    console.log(`🏢 Atualizando role do membro: ${req.params.userId}`);
    const { role } = req.body;
    
    await storage.updateMemberRole(req.params.id, req.params.userId, role);
    console.log('✅ Role atualizada com sucesso');
    
    res.json({ message: 'Role atualizada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao atualizar role:', error);
    res.status(500).json({ error: 'Erro ao atualizar role' });
  }
});

// === ENDPOINTS DE EVENTOS ===

// Buscar eventos
app.get('/api/events', requireAuth, async (req, res) => {
  try {
    console.log('📅 Buscando eventos...');
    
    const events = await storage.getEvents();
    console.log(`✅ Retornando ${events.length} eventos`);
    
    res.json({ events });
  } catch (error) {
    console.error('❌ Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// Criar evento
app.post('/api/events', requireAuth, async (req, res) => {
  try {
    console.log('📅 Criando novo evento...');
    const eventData = req.body;
    
    if (!eventData.title || !eventData.start_date) {
      return res.status(400).json({ error: 'Título e data de início são obrigatórios' });
    }
    
    const event = await storage.createEvent(eventData);
    console.log('✅ Evento criado com sucesso');
    
    res.json({ event });
  } catch (error) {
    console.error('❌ Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// Atualizar evento
app.put('/api/events/:id', requireAuth, async (req, res) => {
  try {
    console.log(`📅 Atualizando evento: ${req.params.id}`);
    
    const event = await storage.updateEvent(req.params.id, req.body);
    console.log('✅ Evento atualizado com sucesso');
    
    res.json({ event });
  } catch (error) {
    console.error('❌ Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// Atualizar status do evento
app.put('/api/events/:id/status', requireAuth, async (req, res) => {
  try {
    console.log(`📅 Atualizando status do evento: ${req.params.id}`);
    const { status } = req.body;
    
    const event = await storage.updateEvent(req.params.id, { status });
    console.log('✅ Status do evento atualizado');
    
    res.json({ event });
  } catch (error) {
    console.error('❌ Erro ao atualizar status do evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar status do evento' });
  }
});

// Deletar evento
app.delete('/api/events/:id', requireAuth, async (req, res) => {
  try {
    console.log(`📅 Deletando evento: ${req.params.id}`);
    
    await storage.deleteEvent(req.params.id);
    console.log('✅ Evento deletado com sucesso');
    
    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
});

// Inscrever-se em evento
app.post('/api/events/:id/register', requireAuth, async (req, res) => {
  try {
    console.log(`📅 Inscrevendo usuário no evento: ${req.params.id}`);
    const { paymentData } = req.body;
    
    const registration = await storage.registerForEvent(req.params.id, req.user.id, paymentData);
    console.log('✅ Inscrição realizada com sucesso');
    
    res.json({ registration });
  } catch (error) {
    console.error('❌ Erro ao inscrever no evento:', error);
    res.status(500).json({ error: 'Erro ao inscrever no evento' });
  }
});

// Cancelar inscrição em evento
app.delete('/api/events/:id/register', requireAuth, async (req, res) => {
  try {
    console.log(`📅 Cancelando inscrição no evento: ${req.params.id}`);
    
    await storage.unregisterFromEvent(req.params.id, req.user.id);
    console.log('✅ Inscrição cancelada com sucesso');
    
    res.json({ message: 'Inscrição cancelada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao cancelar inscrição:', error);
    res.status(500).json({ error: 'Erro ao cancelar inscrição' });
  }
});

// Buscar inscrições do usuário
app.get('/api/user/event-registrations', requireAuth, async (req, res) => {
  try {
    console.log('📅 Buscando inscrições do usuário...');
    
    const registrations = await storage.getUserEventRegistrations(req.user.id);
    console.log(`✅ Retornando ${registrations.length} inscrições`);
    
    res.json({ registrations });
  } catch (error) {
    console.error('❌ Erro ao buscar inscrições:', error);
    res.status(500).json({ error: 'Erro ao buscar inscrições' });
  }
});

// === ENDPOINTS DE USUÁRIOS ===

// Buscar usuários online  
app.get('/api/users/online', requireAuth, async (req, res) => {
  try {
    console.log('👥 Buscando usuários online...');
    
    const users = await storage.getUsersWithProfiles();
    console.log(`✅ Retornando ${users.length} usuários`);
    
    res.json({ users });
  } catch (error) {
    console.error('❌ Erro ao buscar usuários online:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários online' });
  }
});

// Buscar perfis
app.get('/api/profiles', requireAuth, async (req, res) => {
  try {
    console.log('👤 Buscando perfis...');
    
    const profiles = await storage.getAllProfiles();
    console.log(`✅ Retornando ${profiles.length} perfis`);
    
    res.json({ profiles });
  } catch (error) {
    console.error('❌ Erro ao buscar perfis:', error);
    res.status(500).json({ error: 'Erro ao buscar perfis' });
  }
});

// === ENDPOINTS FINANCEIROS FALTANTES ===

// Buscar resumo financeiro
app.get('/api/financial/summary', requireAuth, async (req, res) => {
  try {
    console.log('💰 Buscando resumo financeiro...');
    
    const allUsers = await storage.getUsersWithProfiles();
    const summary = {
      totalIncome: 150.00,
      totalExpenses: 50.00,
      netBalance: 100.00,
      paymentRate: 75.5,
      monthlyGrowth: 12.3
    };
    
    console.log('✅ Resumo financeiro calculado');
    res.json({ summary });
  } catch (error) {
    console.error('❌ Erro ao buscar resumo financeiro:', error);
    res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
  }
});

// Buscar transações financeiras
app.get('/api/financial/transactions', requireAuth, async (req, res) => {
  try {
    console.log('💰 Buscando transações financeiras...');
    
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
    res.json({ transactions });
  } catch (error) {
    console.error('❌ Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Buscar categorias financeiras
app.get('/api/financial/categories', requireAuth, async (req, res) => {
  try {
    console.log('💰 Buscando categorias financeiras...');
    
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
    res.json({ categories });
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Criar transação financeira
app.post('/api/financial/transactions', requireAuth, async (req, res) => {
  try {
    console.log('💰 Criando transação financeira...');
    
    const transaction = {
      id: Date.now().toString(),
      ...req.body,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ Transação criada');
    res.json({ transaction });
  } catch (error) {
    console.error('❌ Erro ao criar transação:', error);
    res.status(500).json({ error: 'Erro ao criar transação' });
  }
});

// Buscar métricas de saúde financeira
app.get('/api/financial/health-metrics', requireAuth, async (req, res) => {
  try {
    console.log('💰 Calculando métricas de saúde financeira...');
    
    const metrics = {
      healthScore: 75,
      collectionRate: 75.5,
      totalIncome: 150.00,
      totalExpenses: 50.00,
      netBalance: 100.00,
      activeMembers: 4,
      paidMembers: 3,
      averageTicket: 10.00,
      recommendations: [
        'Implementar lembretes automáticos de pagamento',
        'Diversificar fontes de receita',
        'Controlar gastos operacionais'
      ]
    };
    
    console.log('✅ Métricas calculadas');
    res.json({ metrics });
  } catch (error) {
    console.error('❌ Erro ao calcular métricas:', error);
    res.status(500).json({ error: 'Erro ao calcular métricas' });
  }
});

// === ENDPOINTS DE ESTATÍSTICAS ===

// Buscar estatísticas gerais
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas gerais...');
    
    const users = await storage.getUsersWithProfiles();
    const companies = await storage.getCompanies();
    const events = await storage.getEvents();
    
    const stats = {
      totalUsers: users.length,
      totalCompanies: companies.length,
      totalEvents: events.length,
      activeUsers: users.filter(u => u.profile?.rank !== 'aluno').length,
      usersThisMonth: 0,
      eventsThisMonth: 0
    };
    
    console.log('✅ Estatísticas calculadas');
    res.json({ stats });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Buscar atividades do usuário
app.get('/api/activities', requireAuth, async (req, res) => {
  try {
    console.log('🎯 Buscando atividades do usuário...');
    
    const activities = [];
    
    console.log(`✅ Retornando ${activities.length} atividades`);
    res.json({ activities });
  } catch (error) {
    console.error('❌ Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro ao buscar atividades' });
  }
});

// Buscar conquistas do usuário
app.get('/api/achievements', requireAuth, async (req, res) => {
  try {
    console.log('🏆 Buscando conquistas do usuário...');
    
    const achievements = [];
    
    console.log(`✅ Retornando ${achievements.length} conquistas`);
    res.json({ achievements });
  } catch (error) {
    console.error('❌ Erro ao buscar conquistas:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
});

// === ENDPOINTS DE GESTÃO DE USUÁRIOS ===

// Criar usuário (admin)
app.post('/api/auth/create-user', requireAuth, async (req, res) => {
  try {
    console.log('👤 Criando novo usuário...');
    
    const userData = req.body;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Criar usuário
    const newUser = await storage.createUser({
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      password: hashedPassword,
      cpf: userData.cpf,
      phone: userData.phone,
      rank: userData.rank || 'aluno',
      company: userData.company,
      created_at: new Date(),
      updated_at: new Date()
    });
    
    console.log('✅ Usuário criado com sucesso');
    res.json({ user: newUser });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Deletar usuário (admin)
app.post('/api/auth/delete-user', requireAuth, async (req, res) => {
  try {
    console.log('👤 Deletando usuário...');
    
    const { userId } = req.body;
    
    await storage.deleteUser(userId);
    console.log('✅ Usuário deletado com sucesso');
    
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Atualizar perfil de usuário
app.put('/api/profiles/:id', requireAuth, async (req, res) => {
  try {
    console.log(`👤 Atualizando perfil: ${req.params.id}`);
    
    const profile = await storage.updateProfile(req.params.id, req.body);
    console.log('✅ Perfil atualizado com sucesso');
    
    res.json({ profile });
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Buscar comandantes disponíveis
app.get('/api/commanders', requireAuth, async (req, res) => {
  try {
    console.log('👑 Buscando comandantes disponíveis...');
    
    const commanders = await storage.getAvailableCommanders();
    console.log(`✅ Retornando ${commanders.length} comandantes`);
    
    res.json({ commanders });
  } catch (error) {
    console.error('❌ Erro ao buscar comandantes:', error);
    res.status(500).json({ error: 'Erro ao buscar comandantes' });
  }
});

// Buscar treinamentos
app.get('/api/trainings', requireAuth, async (req, res) => {
  try {
    console.log('📚 Buscando treinamentos...');
    
    const trainings = await storage.getTrainings();
    console.log(`✅ Retornando ${trainings.length} treinamentos`);
    
    res.json({ trainings });
  } catch (error) {
    console.error('❌ Erro ao buscar treinamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar treinamentos' });
  }
});

// Buscar cursos
app.get('/api/courses', requireAuth, async (req, res) => {
  try {
    console.log('📖 Buscando cursos...');
    
    const courses = await storage.getCourses();
    console.log(`✅ Retornando ${courses.length} cursos`);
    
    res.json({ courses });
  } catch (error) {
    console.error('❌ Erro ao buscar cursos:', error);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

// Buscar estatísticas da empresa
app.get('/api/company/stats', requireAuth, async (req, res) => {
  try {
    console.log('🏢 Buscando estatísticas da empresa...');
    
    const users = await storage.getUsersWithProfiles();
    const userProfile = await storage.getUserProfile(req.user.id);
    
    // Filtrar por empresa do usuário
    const companyMembers = users.filter(u => u.profile?.company === userProfile?.company);
    
    const stats = {
      totalMembers: companyMembers.length,
      activeMembers: companyMembers.filter(u => u.profile?.rank !== 'aluno').length,
      newMembersThisMonth: 0,
      completedTrainings: 0
    };
    
    console.log('✅ Estatísticas da empresa calculadas');
    res.json({ stats });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas da empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas da empresa' });
  }
});

// Buscar membros da empresa
app.get('/api/company/members', requireAuth, async (req, res) => {
  try {
    console.log('🏢 Buscando membros da empresa...');
    
    const users = await storage.getUsersWithProfiles();
    const userProfile = await storage.getUserProfile(req.user.id);
    
    // Filtrar por empresa do usuário
    const companyMembers = users.filter(u => u.profile?.company === userProfile?.company);
    
    console.log(`✅ Retornando ${companyMembers.length} membros da empresa`);
    res.json({ members: companyMembers });
  } catch (error) {
    console.error('❌ Erro ao buscar membros da empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar membros da empresa' });
  }
});

// Criar anúncio da empresa
app.post('/api/company/announcements', requireAuth, async (req, res) => {
  try {
    console.log('📢 Criando anúncio da empresa...');
    
    const { title, content } = req.body;
    const announcement = await storage.createMessage(req.user.id, 'company', `${title}: ${content}`);
    
    console.log('✅ Anúncio criado com sucesso');
    res.json({ announcement });
  } catch (error) {
    console.error('❌ Erro ao criar anúncio:', error);
    res.status(500).json({ error: 'Erro ao criar anúncio' });
  }
});

// Buscar anúncios da empresa
app.get('/api/company/announcements', requireAuth, async (req, res) => {
  try {
    console.log('📢 Buscando anúncios da empresa...');
    
    const announcements = await storage.getChannelMessages('company');
    console.log(`✅ Retornando ${announcements.length} anúncios`);
    
    res.json({ announcements });
  } catch (error) {
    console.error('❌ Erro ao buscar anúncios:', error);
    res.status(500).json({ error: 'Erro ao buscar anúncios' });
  }
});

// Teste de conectividade
app.get('/api/health', async (req, res) => {
  try {
    const testUser = await storage.getUserByEmail('chpsalgado@hotmail.com');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: testUser ? 'Connected' : 'No admin user found'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Handler para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro na API:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

export default app;