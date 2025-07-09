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