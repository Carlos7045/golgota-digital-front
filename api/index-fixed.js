import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';

const app = express();

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

// Estratégia de login simplificada
passport.use(new LocalStrategy({
  usernameField: 'emailOrCpf',
  passwordField: 'password'
}, async (emailOrCpf, password, done) => {
  try {
    // Simulação de login para teste
    if (emailOrCpf === 'chpsalgado@hotmail.com' && password === '123456') {
      return done(null, { 
        id: 1, 
        name: 'Carlos Henrique', 
        email: 'chpsalgado@hotmail.com',
        rank: 'admin'
      });
    }
    return done(null, false, { message: 'Credenciais inválidas' });
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = { 
      id: 1, 
      name: 'Carlos Henrique', 
      email: 'chpsalgado@hotmail.com',
      rank: 'admin'
    };
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

app.get('/api/profile', requireAuth, (req, res) => {
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    rank: req.user.rank
  });
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