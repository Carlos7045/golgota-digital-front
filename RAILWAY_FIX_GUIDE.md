# 🚨 CORREÇÃO RAILWAY - ARQUIVO LIMPO

## ❌ **PROBLEMA:** 
O repositório tem arquivos antigos que causam conflitos de importação.

## ✅ **SOLUÇÃO:** 
Substituir o `server/index.ts` por uma versão limpa e independente.

---

## 🔧 **PASSOS PARA CORRIGIR:**

### **1. Editar server/index.ts no GitHub**

1. Vá para: https://github.com/Carlos7045/comando-golgota-backend
2. Clique em: `server/index.ts`
3. Clique no ícone de lápis para editar
4. **APAGUE TODO O CONTEÚDO** e substitua por:

```typescript
import express from "express";
import session from "express-session";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS para aceitar requisições do frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Session middleware
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET environment variable is required in production');
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'golgota-development-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check endpoint (OBRIGATÓRIO para Railway)
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    message: "Comando Gólgota Backend funcionando!"
  });
});

// API básica
app.get("/api/status", (req, res) => {
  res.json({ 
    message: "🚀 Comando Gólgota Backend ativo!",
    version: "1.0.0",
    database: process.env.DATABASE_URL ? "Conectado" : "Não configurado"
  });
});

// Rota de teste
app.get("/", (req, res) => {
  res.json({ 
    message: "Comando Gólgota Backend - Sistema funcionando",
    endpoints: {
      health: "/health",
      status: "/api/status"
    }
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Rota não encontrada",
    path: req.originalUrl
  });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Erro no servidor:', err.stack);
  res.status(500).json({ 
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

// Iniciar servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Comando Gólgota Backend rodando na porta ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Database: ${process.env.DATABASE_URL ? 'Configurado' : 'Não configurado'}`);
});
```

### **2. Remover Arquivos Problemáticos** (OPCIONAL)

Para evitar conflitos, delete estes arquivos no GitHub:
- `server/vite.ts`
- `server/storage.ts` 
- `server/asaas.ts`
- `server/routes.ts`

### **3. Commit e Deploy**

1. **Commit** as mudanças no GitHub
2. **Volte para Railway**
3. **Clique "Redeploy"**

---

## 🎯 **RESULTADO ESPERADO:**

✅ Build bem-sucedido  
✅ Deploy funcional  
✅ Health check respondendo  
✅ Backend básico ativo  

**Agora deve funcionar sem erros de importação!**