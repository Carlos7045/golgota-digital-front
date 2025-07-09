import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { VercelStorage } from './db-vercel.js';

const app = express();
const storage = new VercelStorage();

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

// Session mais simples para Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'comando-golgota-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none'
  }
}));

// Passport básico
app.use(passport.initialize());
app.use(passport.session());

// Estratégia de login com banco real
passport.use(new LocalStrategy({
  usernameField: 'emailOrCpf',
  passwordField: 'password'
}, async (emailOrCpf, password, done) => {
  try {
    let user = await storage.getUserByEmail(emailOrCpf);
    
    if (!user) {
      const users = await storage.getUsersByRank();
      const profileWithCpf = users.find(u => u.cpf === emailOrCpf.replace(/\D/g, ''));
      if (profileWithCpf) {
        user = await storage.getUser(profileWithCpf.user_id);
      }
    }
    
    if (!user) {
      return done(null, false, { message: 'CPF/Email ou senha inválidos' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return done(null, false, { message: 'CPF/Email ou senha inválidos' });
    }
    
    return done(null, user);
  } catch (error) {
    console.error('Login error:', error);
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Rotas básicas para teste
app.post('/api/auth/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao fazer login' });
      }
      return res.json({ user, message: 'Login realizado com sucesso' });
    });
  })(req, res, next);
});

app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const profile = await storage.getUserProfile(req.user.id);
    res.json({
      id: req.user.id,
      name: profile?.name || 'Usuário',
      email: req.user.email,
      rank: profile?.rank || 'membro',
      profile: profile
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Logout realizado com sucesso' });
  });
});

// Teste de conectividade
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Handler para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;