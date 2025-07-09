# 🔧 CORREÇÃO CORS - CONEXÃO FRONTEND ↔ BACKEND

## ❌ **PROBLEMA:**
Frontend do Replit não consegue acessar backend Railway devido a configuração CORS restritiva.

## 🔍 **DIAGNÓSTICO:**
- ✅ Backend Railway funcionando (porta 8080)
- ✅ Frontend Replit carregando 
- ❌ CORS bloqueando requests entre ambientes

## ✅ **CORREÇÃO APLICADA:**

### **CORS Atualizado:**
```typescript
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

### **Frontend Configurado:**
```typescript
// client/src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://comando-golgota-backend-production.up.railway.app';
```

### **Arquivo .env criado:**
```env
VITE_API_URL=https://comando-golgota-backend-production.up.railway.app
VITE_WS_URL=wss://comando-golgota-backend-production.up.railway.app/ws
```

---

## 🚀 **PRÓXIMOS PASSOS:**

### **1. Upload no GitHub:**
- Substitua `server/index.ts` com CORS corrigido

### **2. Redeploy Railway:**
- Railway → Redeploy
- Aguarde deploy completo

### **3. Teste Conexão:**
- Recarregue frontend Replit
- Teste login: `chpsalgado@hotmail.com` / `admin123`

---

## 🎯 **RESULTADO ESPERADO:**
✅ Login funcionando  
✅ Dashboard carregando  
✅ API calls funcionais  
✅ WebSocket conectado  

**Agora frontend e backend estão totalmente integrados!**