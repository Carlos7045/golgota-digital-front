# Comando Gólgota - URLs de Produção

## 🌐 URLs dos Ambientes

### Desenvolvimento (Replit)
- **URL**: https://workspace-url.replit.app
- **Status**: Ambiente principal de desenvolvimento
- **Acesso**: Privado (apenas desenvolvedores)

### Produção - Frontend (Vercel)
- **URL**: https://golgota-digital-front.vercel.app
- **Repositório**: GitHub vinculado ao Replit
- **Deploy**: Automático via GitHub
- **Status**: Aguardando configuração

### Produção - Backend (Railway)
- **URL**: https://comando-golgota-backend-production.up.railway.app
- **Pasta**: `railway-backend/`
- **Deploy**: Manual via Railway CLI ou GitHub
- **Status**: Aguardando configuração

## 🔧 Configuração Necessária

### Para o Frontend (Vercel)
1. Conectar repositório GitHub no Vercel
2. Configurar variável: `VITE_API_BASE_URL=https://comando-golgota-backend-production.up.railway.app`
3. Deploy será automático

### Para o Backend (Railway)
1. Criar projeto no Railway
2. Configurar Root Directory: `railway-backend`
3. Adicionar variáveis de ambiente:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `ASAAS_API_KEY`
   - `NODE_ENV=production`

## 📋 Status dos Deploys

- [ ] Frontend configurado no Vercel
- [ ] Backend configurado no Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Database conectado
- [ ] CORS configurado
- [ ] Testes em produção realizados

## 🔄 Fluxo de Deploy

1. **Desenvolvimento**: Replit (atual)
2. **Commit**: GitHub (automático)
3. **Frontend**: Vercel (automático)
4. **Backend**: Railway (manual primeiro deploy)

## 🛠️ Comandos Úteis

```bash
# Testar build local
npm run build

# Verificar estrutura railway-backend
ls -la railway-backend/

# Commit para deploy
git add .
git commit -m "Deploy ready"
git push origin main
```