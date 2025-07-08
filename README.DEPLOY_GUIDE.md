# 🚀 GUIA COMPLETO DE DEPLOY - COMANDO GÓLGOTA

## 📋 ESTRUTURA DO PROJETO

Este projeto está organizado para deploy em **3 plataformas diferentes**:

### 🎯 **1. FRONTEND → VERCEL**
- **Arquivos:** `client/`, `vite.config.vercel.ts`, `package.frontend.json`
- **URL:** https://comando-golgota.vercel.app
- **Tecnologias:** React, TypeScript, Vite, Tailwind CSS

### 🎯 **2. BACKEND → RAILWAY**
- **Arquivos:** `server/`, `shared/`, `railway.json`, `package.backend.json`
- **URL:** https://comando-golgota-backend.railway.app
- **Tecnologias:** Node.js, Express, TypeScript, WebSocket

### 🎯 **3. DESENVOLVIMENTO → REPLIT**
- **Arquivos:** Projeto completo, `package.dev.json`
- **URL:** Desenvolvimento local
- **Tecnologias:** Fullstack integrado

---

## 🔧 **CONFIGURAÇÃO POR PLATAFORMA**

### **📦 1. DEPLOY FRONTEND (VERCEL)**

#### **Passo 1: Preparar repositório frontend**
```bash
# Criar repositório separado para frontend
mkdir comando-golgota-frontend
cd comando-golgota-frontend

# Copiar arquivos necessários
cp -r ../client ./
cp -r ../public ./
cp -r ../shared ./
cp ../package.frontend.json ./package.json
cp ../vite.config.vercel.ts ./vite.config.ts
cp ../vercel.json ./
cp ../tailwind.config.ts ./
cp ../postcss.config.js ./
cp ../components.json ./
cp ../.env.example ./

# Inicializar Git
git init
git add .
git commit -m "Frontend para Vercel"
git remote add origin https://github.com/seu-usuario/comando-golgota-frontend.git
git push -u origin main
```

#### **Passo 2: Deploy no Vercel**
1. Acesse https://vercel.com
2. New Project → Import from GitHub
3. Selecione: `comando-golgota-frontend`
4. Configure as variáveis de ambiente:
   ```env
   VITE_API_URL=https://comando-golgota-backend.railway.app
   VITE_WS_URL=wss://comando-golgota-backend.railway.app/ws
   ```
5. Deploy automático

---

### **🚂 2. DEPLOY BACKEND (RAILWAY)**

#### **Passo 1: Preparar repositório backend**
```bash
# Criar repositório separado para backend
mkdir comando-golgota-backend
cd comando-golgota-backend

# Copiar arquivos necessários
cp -r ../server ./
cp -r ../shared ./
cp ../package.backend.json ./package.json
cp ../railway.json ./
cp ../Dockerfile.railway ./Dockerfile
cp ../.env.railway ./.env.example
cp ../drizzle.config.ts ./
cp ../tsconfig.json ./

# Inicializar Git
git init
git add .
git commit -m "Backend para Railway"
git remote add origin https://github.com/seu-usuario/comando-golgota-backend.git
git push -u origin main
```

#### **Passo 2: Deploy no Railway**
1. Acesse https://railway.app
2. New Project → Deploy from GitHub repo
3. Selecione: `comando-golgota-backend`
4. Configure as variáveis de ambiente:
   ```env
   DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
   SESSION_SECRET=sua_chave_secreta_forte_aqui
   NODE_ENV=production
   ASAAS_API_KEY=sua_chave_asaas_producao
   ASAAS_SANDBOX=false
   ```
5. Deploy automático

---

### **💻 3. DESENVOLVIMENTO (REPLIT)**

#### **Arquivos atuais:**
- ✅ `package.json` (limpo, sem comentários)
- ✅ Scripts de desenvolvimento configurados
- ✅ Dependências completas (frontend + backend)

#### **Scripts disponíveis:**
```bash
# Desenvolvimento fullstack
npm run dev

# Desenvolvimento separado
npm run dev:frontend  # Apenas frontend
npm run build:backend # Apenas backend
npm run build:frontend # Apenas frontend

# Banco de dados
npm run db:push
```

---

## 🌐 **CONFIGURAÇÕES DE INTEGRAÇÃO**

### **Frontend → Backend**
Configure no frontend (.env):
```env
VITE_API_URL=https://comando-golgota-backend.railway.app
VITE_WS_URL=wss://comando-golgota-backend.railway.app/ws
```

### **Banco de Dados (Neon)**
Mesmo banco para todas as plataformas:
```env
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### **WebSocket**
- **Desenvolvimento:** `ws://localhost:5000/ws`
- **Produção:** `wss://comando-golgota-backend.railway.app/ws`

---

## 📝 **ARQUIVOS DE CONFIGURAÇÃO**

### **Por Plataforma:**

| Plataforma | Package.json | Config | Extras |
|------------|-------------|---------|---------|
| **Vercel** | `package.frontend.json` | `vite.config.vercel.ts` | `vercel.json` |
| **Railway** | `package.backend.json` | `railway.json` | `Dockerfile.railway` |
| **Replit** | `package.dev.json` | `vite.config.ts` | `.replit` |

### **Variáveis de Ambiente:**

| Variável | Vercel | Railway | Replit |
|----------|---------|---------|--------|
| `DATABASE_URL` | ❌ | ✅ | ✅ |
| `SESSION_SECRET` | ❌ | ✅ | ✅ |
| `VITE_API_URL` | ✅ | ❌ | ✅ |
| `VITE_WS_URL` | ✅ | ❌ | ✅ |
| `ASAAS_API_KEY` | ❌ | ✅ | ✅ |

---

## 🔄 **WORKFLOW DE DESENVOLVIMENTO**

### **1. Desenvolver no Replit**
```bash
npm run dev  # Fullstack local
# Fazer alterações e testar
```

### **2. Commit e Push**
```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

### **3. Deploy Automático**
- **Frontend:** Vercel detecta mudanças em `comando-golgota-frontend`
- **Backend:** Railway detecta mudanças em `comando-golgota-backend`

### **4. Sincronizar Repositórios**
```bash
# Atualizar frontend
cd comando-golgota-frontend
cp -r ../client/* ./client/
git add . && git commit -m "Sync frontend" && git push

# Atualizar backend
cd comando-golgota-backend
cp -r ../server/* ./server/
cp -r ../shared/* ./shared/
git add . && git commit -m "Sync backend" && git push
```

---

## ✅ **CHECKLIST DE DEPLOY**

### **Antes do Deploy:**
- [ ] Testar localmente no Replit
- [ ] Verificar variáveis de ambiente
- [ ] Confirmar conexão com banco Neon
- [ ] Testar WebSocket
- [ ] Validar uploads de arquivos

### **Após Deploy:**
- [ ] Frontend funcionando no Vercel
- [ ] Backend respondendo no Railway
- [ ] WebSocket conectando
- [ ] Database migrations aplicadas
- [ ] SSL/HTTPS ativo

### **Monitoramento:**
- [ ] Health check: `/health`
- [ ] Logs do Railway
- [ ] Analytics do Vercel
- [ ] Métricas do Neon

---

## 🎉 **RESULTADO FINAL**

Após seguir este guia você terá:

✅ **Frontend no Vercel** - Interface rápida e global  
✅ **Backend no Railway** - API escalável com WebSocket  
✅ **Banco no Neon** - PostgreSQL serverless  
✅ **Desenvolvimento no Replit** - Ambiente completo  

**🚀 ARQUITETURA MODERNA E ESCALÁVEL!**