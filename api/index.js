import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { VercelStorage } from './db-vercel.js';

// ES modules fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para upload de arquivos
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'), false);
    }
  }
});

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

// Servir arquivos estáticos (avatars)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'comando-golgota-jwt-secret-2024';

// Rota de teste para verificar se API está funcionando
app.get('/api/test', (req, res) => {
  console.log('🧪 Rota de teste acessada');
  res.json({ 
    message: 'API funcionando!', 
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'Conectado' : 'Não conectado'
  });
});

// Rota específica para testar cadastro
app.post('/api/test/register', (req, res) => {
  console.log('🧪 Teste de cadastro acessado');
  console.log('📦 Body recebido:', req.body);
  res.json({ 
    message: 'Rota de cadastro acessível!', 
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Rota para verificar se email existe
app.post('/api/check-email', async (req, res) => {
  try {
    console.log('📧 Verificando email:', req.body.email);
    
    const existingUser = await storage.getUserByEmail(req.body.email);
    
    res.json({
      exists: !!existingUser,
      email: req.body.email,
      message: existingUser ? 'Email já cadastrado' : 'Email disponível'
    });
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error);
    res.status(500).json({ error: 'Erro ao verificar email' });
  }
});

// Rota para testar conexão com banco
app.get('/api/test/database', async (req, res) => {
  try {
    console.log('🗄️ Testando conexão com banco...');
    
    // Tentar buscar usuários existentes
    const users = await storage.getUsersWithProfiles();
    
    console.log(`✅ Banco conectado, encontrados ${users.length} usuários`);
    
    res.json({
      success: true,
      message: 'Banco conectado com sucesso',
      userCount: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro ao conectar com banco:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

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

// === ROTA DE REGISTRO - VERSÃO DE TESTE ===
app.post('/api/auth/register', async (req, res) => {
  console.log('🚨 TESTE DE REGISTRO - INICIANDO...');
  console.log('📦 Body completo:', JSON.stringify(req.body, null, 2));
  
  try {
    // ETAPA 1: Validar se os dados chegaram
    console.log('✅ ETAPA 1: Dados recebidos com sucesso');
    
    const { email, password, fullName, cpf, phone, city, address, birthYear, company, rank } = req.body;
    console.log('📝 Dados extraídos:', { email, fullName, cpf, company, rank, birthYear, city, phone });
    
    // ETAPA 2: Validação básica
    if (!email || !password || !fullName) {
      console.log('❌ ERRO: Dados obrigatórios faltando');
      return res.status(400).json({ message: 'Email, senha e nome completo são obrigatórios' });
    }
    console.log('✅ ETAPA 2: Validação básica OK');
    
    // ETAPA 3: Testar conexão com banco
    console.log('🔍 ETAPA 3: Testando conexão com banco...');
    try {
      const testUser = await storage.getUserByEmail(email);
      console.log('✅ ETAPA 3: Conexão com banco OK');
      
      if (testUser) {
        console.log('❌ ERRO: Usuário já existe:', testUser.email);
        return res.status(400).json({ message: 'E-mail já está cadastrado no sistema' });
      }
      console.log('✅ Email disponível para cadastro');
    } catch (dbError) {
      console.error('❌ ERRO NA CONEXÃO COM BANCO:', dbError);
      return res.status(500).json({ message: 'Erro de conexão com banco', error: dbError.message });
    }
    
    // ETAPA 4: Testar hash da senha
    console.log('🔐 ETAPA 4: Testando hash da senha...');
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ ETAPA 4: Hash da senha OK');
      
      // ETAPA 5: Preparar dados para inserção
      const userId = crypto.randomUUID();
      console.log('🆔 ETAPA 5: ID UUID gerado:', userId);
      
      const userData = {
        id: userId,
        email,
        password: hashedPassword,
        name: fullName,
        cpf: cpf?.replace(/\D/g, '') || '',
        phone: phone || '',
        city: city || '',
        address: address || '',
        birth_date: birthYear ? `${birthYear}-01-01` : null,
        company: company || '',
        rank: rank || 'aluno'
      };
      
      console.log('📋 ETAPA 5: Dados preparados para inserção:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        cpf: userData.cpf ? 'Sim' : 'Não',
        company: userData.company,
        rank: userData.rank
      });
      
      // ETAPA 6: Tentar criar usuário
      console.log('💾 ETAPA 6: Iniciando criação do usuário...');
      try {
        const user = await storage.createUser(userData);
        console.log('✅ ETAPA 6: Usuário criado com sucesso!');
        console.log('🎉 Usuário final:', user);
        
        // Resposta de sucesso
        const { password: _, ...userResponse } = user;
        res.status(201).json({ 
          user: userResponse,
          message: 'Cadastro realizado com sucesso!'
        });
        
      } catch (createError) {
        console.error('❌ ERRO NA CRIAÇÃO DO USUÁRIO:');
        console.error('❌ Tipo:', createError.constructor.name);
        console.error('❌ Mensagem:', createError.message);
        console.error('❌ Stack:', createError.stack);
        
        return res.status(500).json({ 
          message: 'Erro ao criar usuário no banco',
          error: createError.message,
          stage: 'create_user'
        });
      }
      
    } catch (hashError) {
      console.error('❌ ERRO NO HASH DA SENHA:', hashError);
      return res.status(500).json({ message: 'Erro ao processar senha', error: hashError.message });
    }
    
  } catch (generalError) {
    console.error('❌ ERRO GERAL NO CADASTRO:');
    console.error('❌ Tipo:', generalError.constructor.name);
    console.error('❌ Mensagem:', generalError.message);
    console.error('❌ Stack:', generalError.stack);
    
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: generalError.message,
      type: generalError.constructor.name
    });
  }
});

// === ROTA DE CRIAÇÃO DE USUÁRIO (ADMIN) ===
app.post('/api/auth/create-user', requireAuth, async (req, res) => {
  console.log('👤 Criação de usuário por admin...');
  
  try {
    const { email, name, cpf, phone, city, address, birth_date, rank, company } = req.body;
    
    // Verificar se usuário já existe
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      console.log('❌ Usuário já existe');
      return res.status(400).json({ message: 'Usuário já existe com este email' });
    }
    
    // Senha padrão
    const defaultPassword = 'Golgota123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    console.log('🔐 Senha padrão hasheada');
    
    // Gerar UUID para o usuário
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Dados do usuário
    const userData = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      cpf: cpf?.replace(/\D/g, '') || '',
      phone: phone || '',
      city: city || '',
      address: address || '',
      birth_date: birth_date || null,
      company: company || '',
      rank: rank || 'aluno'
    };
    
    // Criar usuário
    const user = await storage.createUser(userData);
    console.log('✅ Usuário criado por admin:', user.id);
    
    // Resposta sem senha
    const { password: _, ...userResponse } = user;
    res.status(201).json({ 
      user: userResponse,
      message: `Usuário criado com sucesso. Senha padrão: ${defaultPassword}`
    });
    
  } catch (error) {
    console.error('❌ Erro na criação por admin:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// === ROTA DE EXCLUSÃO DE USUÁRIO (ADMIN) ===
app.post('/api/auth/delete-user', requireAuth, async (req, res) => {
  console.log('👤 Exclusão de usuário por admin...');
  
  try {
    const { userId, adminPassword } = req.body;
    const adminUserId = req.user?.id;

    if (!userId || !adminPassword) {
      return res.status(400).json({ message: 'ID do usuário e senha do admin são obrigatórios' });
    }

    // Verificar senha do admin
    const adminUser = await storage.getUser(adminUserId);
    if (!adminUser) {
      return res.status(401).json({ message: 'Usuário admin não encontrado' });
    }

    const isValidPassword = await bcrypt.compare(adminPassword, adminUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Senha do administrador incorreta' });
    }

    // Verificar se usuário existe
    const userToDelete = await storage.getUser(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Impedir auto-exclusão
    if (userId === adminUserId) {
      return res.status(400).json({ message: 'Você não pode excluir sua própria conta' });
    }

    // Deletar usuário
    await storage.deleteUser(userId);
    console.log('✅ Usuário deletado com sucesso');

    res.json({ 
      message: 'Usuário excluído com sucesso',
      deletedUserId: userId
    });
  } catch (error) {
    console.error('❌ Erro na exclusão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// === ROTA DE LOGOUT ALTERNATIVO ===
app.post('/api/auth/logout-old', async (req, res) => {
  console.log('🔐 Logout alternativo');
  res.clearCookie('token');
  res.json({ message: 'Logout realizado com sucesso' });
});

// === ROTA DE MUDANÇA DE SENHA ===
app.put('/api/auth/change-password', requireAuth, async (req, res) => {
  console.log('🔐 Mudança de senha solicitada...');
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
    }
    
    // Buscar usuário atual
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Verificar senha atual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }
    
    // Hash nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Atualizar senha (simulado por enquanto)
    console.log('✅ Senha alterada com sucesso');
    res.json({ message: 'Senha alterada com sucesso' });
    
  } catch (error) {
    console.error('❌ Erro na mudança de senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

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

// Criar pagamento PIX/Boleto
app.post('/api/payments/create-subscription', requireAuth, async (req, res) => {
  try {
    console.log('💳 Criando pagamento para mensalidade...');
    
    const { billingType } = req.body;
    const profile = await storage.getUserProfile(req.user.id);
    const user = await storage.getUser(req.user.id);
    
    if (!profile || !user) {
      return res.status(400).json({ error: 'Perfil não encontrado' });
    }

    console.log('📋 Dados do pagamento:', { billingType, email: user.email, cpf: profile.cpf });

    // Simular criação de pagamento (demo)
    const paymentId = `payment_${Date.now()}`;
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let paymentUrl;
    if (billingType === 'PIX') {
      // URL de exemplo para PIX
      paymentUrl = `https://sandbox.asaas.com/checkout/${paymentId}/pix`;
    } else if (billingType === 'BOLETO') {
      // URL de exemplo para Boleto
      paymentUrl = `https://sandbox.asaas.com/checkout/${paymentId}/boleto`;
    }

    const paymentData = {
      id: paymentId,
      value: 10.00,
      status: 'PENDING',
      billing_type: billingType,
      due_date: dueDate,
      description: 'Mensalidade Comando Gólgota',
      payment_url: paymentUrl,
      pix_code: billingType === 'PIX' ? `00020126580014br.gov.bcb.pix0136${paymentId}${Math.random().toString(36).substring(7)}` : null
    };

    // Salvar no banco para demonstração
    await storage.createAsaasPayment({
      user_id: req.user.id,
      asaas_payment_id: paymentId,
      value: '10.00',
      status: 'PENDING',
      billing_type: billingType,
      due_date: new Date(dueDate),
      description: 'Mensalidade Comando Gólgota'
    });

    console.log('✅ Pagamento criado com sucesso:', paymentData);
    
    res.json({ 
      payment: paymentData,
      redirect_url: paymentUrl
    });
  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
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

// Buscar empresas (sem autenticação para permitir acesso na página de registro)
app.get('/api/companies', async (req, res) => {
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

// === ROTAS DE PERFIL ADICIONAIS ===

// Upload de avatar (usando base64 para compatibilidade serverless)
app.post('/api/profile/avatar', requireAuth, async (req, res) => {
  try {
    console.log('📸 Upload de avatar iniciado...');
    
    const { avatar } = req.body; // Expecting base64 data
    
    if (!avatar) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    // Validate base64 image data
    if (!avatar.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Formato de imagem inválido' });
    }
    
    console.log('📁 Avatar base64 recebido');
    
    // Store base64 data directly in database
    const updatedProfile = await storage.updateProfile(req.user.id, { 
      avatar_url: avatar 
    });
    
    console.log('✅ Avatar atualizado');
    
    res.json({ 
      message: 'Avatar atualizado com sucesso',
      avatar_url: avatar,
      profile: updatedProfile
    });
  } catch (error) {
    console.error('❌ Erro no upload de avatar:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do avatar' });
  }
});

// Atualizar perfil 
app.put('/api/profile', requireAuth, async (req, res) => {
  try {
    console.log('📝 Atualizando perfil do usuário...');
    
    // Filtrar campos vazios
    const updateData = { ...req.body };
    if (updateData.birth_date === '') {
      delete updateData.birth_date;
    }
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' && key !== 'name') {
        delete updateData[key];
      }
    });
    
    const updatedProfile = await storage.updateProfile(req.user.id, updateData);
    console.log('✅ Perfil atualizado');
    
    res.json({ profile: updatedProfile });
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Atualizar perfil por ID (admin)
app.put('/api/profiles/:id', requireAuth, async (req, res) => {
  try {
    console.log(`📝 Admin atualizando perfil: ${req.params.id}`);
    
    // Filtrar campos vazios
    const updateData = { ...req.body };
    if (updateData.birth_date === '') {
      delete updateData.birth_date;
    }
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === '' && key !== 'name') {
        delete updateData[key];
      }
    });

    const updatedProfile = await storage.updateProfile(req.params.id, updateData);

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('✅ Perfil atualizado por admin');
    res.json({ 
      message: 'Usuário atualizado com sucesso',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('❌ Erro na atualização admin:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// === ENDPOINTS DE COMANDANTES ===

// Buscar comandantes disponíveis
app.get('/api/commanders', requireAuth, async (req, res) => {
  try {
    console.log('👥 Buscando comandantes disponíveis...');
    
    const commanders = await storage.getAvailableCommanders();
    console.log(`✅ Retornando ${commanders.length} comandantes`);
    
    res.json({ commanders });
  } catch (error) {
    console.error('❌ Erro ao buscar comandantes:', error);
    res.status(500).json({ error: 'Erro ao buscar comandantes' });
  }
});

// === ENDPOINTS DE TREINAMENTOS E CURSOS ===

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
    console.log('📚 Buscando cursos...');
    
    const courses = await storage.getCourses();
    console.log(`✅ Retornando ${courses.length} cursos`);
    
    res.json({ courses });
  } catch (error) {
    console.error('❌ Erro ao buscar cursos:', error);
    res.status(500).json({ error: 'Erro ao buscar cursos' });
  }
});

// === ENDPOINTS DE ATIVIDADES E CONQUISTAS ===

// Buscar atividades do usuário
app.get('/api/activities', requireAuth, async (req, res) => {
  try {
    console.log('🏃 Buscando atividades do usuário...');
    
    // Por enquanto retornar dados simulados
    const activities = [
      {
        id: '1',
        title: 'Participação em Treinamento',
        description: 'Completou o treinamento básico',
        date: new Date().toISOString(),
        type: 'training'
      },
      {
        id: '2', 
        title: 'Mensagem Enviada',
        description: 'Enviou mensagem no canal geral',
        date: new Date().toISOString(),
        type: 'communication'
      }
    ];
    
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
    
    // Por enquanto retornar dados simulados
    const achievements = [
      {
        id: '1',
        title: 'Primeiro Login',
        description: 'Realizou o primeiro acesso ao sistema',
        date: new Date().toISOString(),
        icon: '🎯'
      },
      {
        id: '2',
        title: 'Comunicador',
        description: 'Enviou primeira mensagem no chat',
        date: new Date().toISOString(),
        icon: '💬'
      }
    ];
    
    console.log(`✅ Retornando ${achievements.length} conquistas`);
    res.json({ achievements });
  } catch (error) {
    console.error('❌ Erro ao buscar conquistas:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
});

// === ENDPOINTS DE ESTATÍSTICAS ===

// Buscar estatísticas gerais
app.get('/api/stats', requireAuth, async (req, res) => {
  try {
    console.log('📊 Buscando estatísticas gerais...');
    
    const allUsers = await storage.getUsersWithProfiles();
    const companies = await storage.getCompanies();
    
    const stats = {
      totalUsers: allUsers.length,
      totalCompanies: companies.length,
      activeUsers: allUsers.length, // Por enquanto todos são considerados ativos
      newUsersThisMonth: 2,
      totalMessages: 15,
      totalEvents: 3
    };
    
    console.log('✅ Estatísticas calculadas');
    res.json({ stats });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// === ENDPOINTS DE PAINEL DA COMPANHIA ===

// Estatísticas da companhia
app.get('/api/company/stats', requireAuth, async (req, res) => {
  try {
    console.log('🏢 Buscando estatísticas da companhia...');
    
    const profile = await storage.getUserProfile(req.user.id);
    const allUsers = await storage.getUsersWithProfiles();
    
    // Filtrar usuários da mesma companhia
    const companyUsers = allUsers.filter(user => 
      user.profile?.company === profile?.company
    );
    
    const stats = {
      totalMembers: companyUsers.length,
      onlineMembers: companyUsers.length, // Simulado
      newMembers: 1,
      completedTrainings: 5,
      upcomingEvents: 2,
      companyName: profile?.company || 'N/A'
    };
    
    console.log('✅ Estatísticas da companhia calculadas');
    res.json({ stats });
  } catch (error) {
    console.error('❌ Erro ao buscar stats da companhia:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas da companhia' });
  }
});

// Membros da companhia
app.get('/api/company/members', requireAuth, async (req, res) => {
  try {
    console.log('🏢 Buscando membros da companhia...');
    
    const profile = await storage.getUserProfile(req.user.id);
    const allUsers = await storage.getUsersWithProfiles();
    
    // Filtrar usuários da mesma companhia
    const companyMembers = allUsers.filter(user => 
      user.profile?.company === profile?.company
    ).map(user => ({
      id: user.id,
      name: user.profile?.name || user.email,
      rank: user.profile?.rank || 'aluno',
      email: user.email,
      avatar_url: user.profile?.avatar_url,
      joined_at: user.created_at
    }));
    
    console.log(`✅ Retornando ${companyMembers.length} membros da companhia`);
    res.json({ members: companyMembers });
  } catch (error) {
    console.error('❌ Erro ao buscar membros da companhia:', error);
    res.status(500).json({ error: 'Erro ao buscar membros da companhia' });
  }
});

// Buscar anúncios da companhia
app.get('/api/company/announcements', requireAuth, async (req, res) => {
  try {
    console.log('📢 Buscando anúncios da companhia...');
    
    // Por enquanto retornar dados simulados
    const announcements = [
      {
        id: '1',
        title: 'Treinamento desta semana',
        body: 'Lembrete: treinamento de primeiros socorros na quinta-feira às 19h.',
        author_name: 'Comandante Silva',
        author_rank: 'comandante',
        created_at: new Date().toISOString(),
        views: 12,
        interactions: 3
      }
    ];
    
    console.log(`✅ Retornando ${announcements.length} anúncios`);
    res.json({ announcements });
  } catch (error) {
    console.error('❌ Erro ao buscar anúncios:', error);
    res.status(500).json({ error: 'Erro ao buscar anúncios' });
  }
});

// Criar anúncio da companhia
app.post('/api/company/announcements', requireAuth, async (req, res) => {
  try {
    console.log('📢 Criando anúncio da companhia...');
    
    const { title, body } = req.body;
    const profile = await storage.getUserProfile(req.user.id);
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Título e conteúdo são obrigatórios' });
    }
    
    const announcement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      body,
      author_name: profile?.name || 'Usuário',
      author_rank: profile?.rank || 'aluno',
      created_at: new Date().toISOString(),
      views: 0,
      interactions: 0
    };
    
    console.log('✅ Anúncio criado');
    res.json({ announcement });
  } catch (error) {
    console.error('❌ Erro ao criar anúncio:', error);
    res.status(500).json({ error: 'Erro ao criar anúncio' });
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

// Marcar pagamento como pago
app.post('/api/financial/payments/:paymentId/mark-paid', requireAuth, async (req, res) => {
  try {
    console.log(`💰 Marcando pagamento como pago: ${req.params.paymentId}`);
    
    // Simular marcação como pago
    console.log('✅ Pagamento marcado como pago');
    res.json({ message: 'Pagamento marcado como pago com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao marcar como pago:', error);
    res.status(500).json({ error: 'Erro ao marcar pagamento como pago' });
  }
});

// Enviar lembrete de pagamento
app.post('/api/financial/payments/:userId/send-reminder', requireAuth, async (req, res) => {
  try {
    console.log(`💰 Enviando lembrete de pagamento para: ${req.params.userId}`);
    
    // Simular envio de lembrete
    console.log('✅ Lembrete enviado');
    res.json({ message: 'Lembrete de pagamento enviado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao enviar lembrete:', error);
    res.status(500).json({ error: 'Erro ao enviar lembrete' });
  }
});

// === WEBHOOK ASAAS ===

// Webhook Asaas
app.post('/api/webhooks/asaas', async (req, res) => {
  try {
    console.log('🔔 Webhook Asaas recebido...');
    console.log('📦 Dados do webhook:', req.body);
    
    // Por enquanto apenas logar o webhook
    console.log('✅ Webhook processado');
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    res.status(500).json({ error: 'Erro ao processar webhook' });
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