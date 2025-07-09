# Comando Gólgota - Guia de Deploy

Este guia descreve como fazer deploy do frontend na Vercel e do backend no Railway.

## 🚀 Estrutura de Deploy

- **Frontend**: Vercel (usando repositório GitHub)
- **Backend**: Railway (pasta `railway-backend`)
- **Desenvolvimento**: Replit (ambiente principal)

## 📁 Estrutura dos Arquivos

```
golgota-digital-front/
├── client/                 # Frontend (React/Vite)
├── server/                 # Backend desenvolvimento
├── railway-backend/        # Backend para produção (Railway)
├── shared/                 # Schemas compartilhados
├── vercel.json            # Configuração Vercel
└── dist/                  # Build gerado
```

## 🔧 Frontend - Deploy no Vercel

### 1. Configuração Automática
O arquivo `vercel.json` já está configurado com:
- Build command: `npm run build`
- Output directory: `dist/public`
- Redirecionamento de API para Railway
- CORS headers configurados

### 2. Passos para Deploy

```bash
# 1. Fazer build do projeto
npm run build

# 2. Commit no GitHub
git add .
git commit -m "Deploy: Frontend e Backend separados"
git push origin main

# 3. No Vercel
# - Conectar repositório GitHub
# - Deploy será automático
```

### 3. Variáveis de Ambiente (Vercel)
Configure no painel do Vercel:
```env
VITE_API_BASE_URL=https://comando-golgota-backend-production.up.railway.app
```

## 🚂 Backend - Deploy no Railway

### 1. Configuração do Projeto
A pasta `railway-backend` contém:
- `package.json` específico para backend
- Todos os arquivos do servidor
- Configurações de deploy (`railway.json`, `nixpacks.toml`)

### 2. Passos para Deploy

```bash
# 1. No Railway (https://railway.app)
# - Criar novo projeto
# - Conectar repositório GitHub
# - Configurar Root Directory: railway-backend

# 2. Adicionar PostgreSQL (opcional)
# - Add service > PostgreSQL
# - Ou usar database externo
```

### 3. Variáveis de Ambiente (Railway)
Configure no painel do Railway:
```env
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-secret-session-key-here
ASAAS_API_KEY=your-asaas-api-key-here
ASAAS_SANDBOX=false
NODE_ENV=production
PORT=5000
```

### 4. Database Setup
Se usar PostgreSQL do Railway:
```bash
# Após deploy, executar migrações
npm run db:push
```

## 🔄 URLs de Produção

Após deploy, as URLs serão:
- **Frontend**: `https://[projeto].vercel.app`
- **Backend**: `https://[projeto].up.railway.app`

## 🛠️ Configurações CORS

O backend está configurado para aceitar requests de:
- `https://golgota-digital-front.vercel.app`
- `https://comando-golgota-frontend.vercel.app`
- `http://localhost:5173` (desenvolvimento)
- `http://localhost:5000` (desenvolvimento)

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Projeto funcionando no Replit
- [ ] Build executado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado no backend

### Após Deploy
- [ ] Frontend carregando no Vercel
- [ ] Backend respondendo no Railway
- [ ] API funcionando (testar login)
- [ ] Database conectado
- [ ] Payments funcionando

## 🐛 Solução de Problemas

### Frontend não carrega
1. Verificar se build foi gerado (`dist/public`)
2. Verificar variável `VITE_API_BASE_URL`
3. Verificar logs no Vercel

### Backend não responde
1. Verificar logs no Railway
2. Verificar `DATABASE_URL`
3. Testar endpoint `/health`

### CORS Error
1. Verificar se frontend URL está na lista de origens permitidas
2. Verificar se cookies estão sendo enviados

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs de deploy
2. Testar endpoints individualmente
3. Verificar variáveis de ambiente
4. Consultar documentação oficial (Vercel/Railway)

---

## 🔄 Desenvolvimento Contínuo

Após setup inicial:
1. Continue desenvolvimento no Replit
2. Faça commits regulares
3. Deploy automático será acionado
4. Teste sempre em produção após mudanças importantes