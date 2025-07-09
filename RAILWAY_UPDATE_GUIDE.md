# 🚂 RAILWAY - GUIA DE ATUALIZAÇÃO

## 📋 **ARQUIVOS CRÍTICOS PARA ATUALIZAR**

### **1. server/index.ts**
```typescript
// CORS corrigido para aceitar Vercel + Replit
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://comando-golgota.vercel.app',
        'https://comando-golgota-frontend.vercel.app',
        'https://replit.com',
        'https://comando-golgota-dev.replit.app',
        /\.replit\.app$/,
        /\.replit\.dev$/
      ]
    : ['http://localhost:5000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### **2. server/routes.ts**
```typescript
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { emailOrCpf, password } = req.body;
    
    if (!emailOrCpf || !password) {
      return res.status(400).json({ message: 'CPF/Email e senha são obrigatórios' });
    }
    
    // Try to find user by email first
    let user = await storage.getUserByEmail(emailOrCpf);
    
    if (!user) {
      return res.status(401).json({ message: 'CPF/Email ou senha inválidos' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'CPF/Email ou senha inválidos' });
    }
    
    // Create session
    req.session!.userId = user.id;
    
    // Get user profile and roles
    const profile = await storage.getProfile ? await storage.getProfile(user.id) : null;
    const roles = await storage.getUserRoles ? await storage.getUserRoles(user.id) : [];
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.json({ 
      user: userResponse,
      profile,
      roles,
      force_password_change: user.force_password_change || false
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});
```

---

## 🔧 **VARIÁVEIS DE AMBIENTE - RAILWAY**

```env
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=comando-golgota-secret-2025
NODE_ENV=production
PORT=8080
```

---

## 📤 **PASSOS PARA ATUALIZAR**

### **Opção 1: Upload Manual**
1. Baixe os arquivos corrigidos do Replit
2. Substitua no repositório Railway:
   - `server/index.ts`
   - `server/routes.ts`
3. Commit e push

### **Opção 2: Copy-Paste**
1. Copie o conteúdo dos arquivos corrigidos
2. Cole no GitHub do repositório Railway
3. Commit direto no GitHub

---

## ✅ **TESTE FINAL**

Após deploy:
1. **Health Check:** https://comando-golgota-backend-production.up.railway.app/health
2. **Login Test:** Frontend Vercel → Login com `chpsalgado@hotmail.com` / `123456`
3. **WebSocket:** Teste chat em tempo real

---

## 🎯 **RESULTADO ESPERADO**

- ✅ Frontend Vercel conecta com Backend Railway
- ✅ Login funcionando com dados reais
- ✅ Dashboard carregando perfeitamente
- ✅ WebSocket funcionando
- ✅ Todos os recursos operacionais