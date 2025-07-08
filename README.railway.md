# 🚀 Deploy do Backend Comando Gólgota no Railway

## ✅ BACKEND PREPARADO PARA RAILWAY

### **📋 Verificações Concluídas:**

1. **✅ Servidor Express configurado para 0.0.0.0 e PORT dinâmico**
2. **✅ tsx configurado corretamente para TypeScript**
3. **✅ WebSocket (ws) implementado no path `/ws`**
4. **✅ Passport.js e Express Session operacionais**
5. **✅ Multer configurado para Railway (temp directory)**
6. **✅ Banco Neon conectado com SSL**
7. **✅ Health check endpoint: `/health`**

### **🔧 Configurações Railway:**

#### **Variáveis de Ambiente (OBRIGATÓRIAS):**
```env
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=seu_session_secret_super_seguro_aqui
NODE_ENV=production
ASAAS_API_KEY=sua_chave_asaas_aqui
ASAAS_SANDBOX=false
```

#### **Build & Deploy Commands:**
- **Build Command:** `npm run build:server`
- **Start Command:** `npm run start:server`
- **Health Check:** `/health`

### **📁 Arquivos Criados para Railway:**

- ✅ **railway.json** - Configuração do Railway
- ✅ **package.railway.json** - Dependencies apenas backend
- ✅ **.env.railway** - Template de variáveis
- ✅ **Dockerfile.railway** - Opcional para deploy customizado

### **🌐 WebSocket Implementado:**

- **Endpoint:** `wss://seu-app.railway.app/ws`
- **Funcionalidades:**
  - Chat em tempo real
  - Status online/offline
  - Notificações automáticas

### **📂 Upload de Arquivos:**

- **Desenvolvimento:** `public/avatars/`
- **Produção:** `/tmp/avatars/` (Railway temp dir)
- **Limite:** 5MB por arquivo
- **Tipos:** Apenas imagens

### **🔒 Segurança:**

- **Session Secret:** Obrigatório em produção
- **HTTPS:** Cookies seguros em produção
- **CORS:** Configurado automaticamente
- **Rate Limiting:** Implementado

### **⚙️ Passos para Deploy:**

#### **1. Preparar Repositório:**
```bash
# Criar repositório GitHub apenas com backend
mkdir comando-golgota-backend
cp -r server/ shared/ package.railway.json railway.json comando-golgota-backend/
cd comando-golgota-backend
git init
git add .
git commit -m "Backend preparado para Railway"
git remote add origin https://github.com/seu-usuario/comando-golgota-backend.git
git push -u origin main
```

#### **2. Deploy no Railway:**
1. Acesse https://railway.app
2. New Project → Deploy from GitHub repo
3. Selecione: comando-golgota-backend
4. Configure as variáveis de ambiente
5. Deploy automático

#### **3. Configurar Domínio:**
- Railway gerará: `https://seu-app.railway.app`
- Configure domínio customizado se desejar

### **📊 Monitoramento:**

- **Health Check:** `/health`
- **Logs:** Railway dashboard
- **Métricas:** CPU, RAM, Network automáticas
- **Uptime:** 99.9% garantido

### **🔄 Integração com Frontend:**

Configure no frontend (Vercel):
```env
VITE_API_URL=https://seu-app.railway.app
VITE_WS_URL=wss://seu-app.railway.app/ws
```

### **✅ Funcionalidades Testadas:**

- [x] Autenticação (login/logout)
- [x] CRUD de usuários
- [x] Sistema de pagamentos Asaas
- [x] Upload de avatares
- [x] WebSocket chat
- [x] Dashboard financeiro
- [x] Gerenciamento de eventos
- [x] Sistema de empresas

### **📝 Estrutura Final:**

```
comando-golgota-backend/
├── server/               # Código do servidor
├── shared/              # Schemas compartilhados
├── package.railway.json # Package.json otimizado
├── railway.json         # Configuração Railway
├── .env.railway         # Template variáveis
└── README.railway.md    # Esta documentação
```

### **🚀 Resultado Esperado:**

Após deploy no Railway:
- ✅ API funcionando em https://seu-app.railway.app
- ✅ WebSocket em wss://seu-app.railway.app/ws
- ✅ Banco Neon conectado
- ✅ Sistema completo operacional
- ✅ SSL/HTTPS automático
- ✅ Deploy automático via Git

### **💡 Dicas Importantes:**

1. **Primeiro Deploy:** Pode levar 2-3 minutos
2. **Auto-deploy:** Push no GitHub = deploy automático
3. **Logs:** Acesse via Railway dashboard
4. **Backups:** Neon faz backup automático
5. **Custos:** Railway tem tier gratuito limitado

O backend está **100% pronto** para deploy no Railway!