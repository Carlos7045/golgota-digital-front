import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import { Storage } from '../dist/storage.js';
import { registerRoutes } from '../dist/routes.js';
import { configureAsaasCheckout } from '../dist/asaas.js';

const app = express();

// Configuração do CORS para Vercel
app.use(cors({
  origin: process.env.VERCEL_URL ? [
    `https://${process.env.VERCEL_URL}`,
    /\.vercel\.app$/,
    /localhost/
  ] : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration para Vercel
app.use(session({
  secret: process.env.SESSION_SECRET || 'comando-golgota-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Configuração do Passport
const storage = new Storage();

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

// Inicialização do Asaas
configureAsaasCheckout().catch(console.error);

// Registrar rotas
registerRoutes(app);

// Handler para Vercel
export default app;