# 🚀 DEPLOY COMANDO GÓLGOTA - GUIA RÁPIDO

## 📋 CONFIGURAÇÃO RÁPIDA

### 1. Variáveis de Ambiente (Vercel)
```env
DATABASE_URL=postgresql://user:password@hostname:port/database
SESSION_SECRET=sua-chave-secreta-forte-32-caracteres
ASAAS_API_KEY=sua-chave-api-asaas
ASAAS_SANDBOX=false
NODE_ENV=production
```

### 2. Configuração Vercel
- **Build Command**: `npm run build:vercel`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`
- **Framework**: Other

### 3. Comandos Essenciais
```bash
# Deploy local test
npm run build:vercel

# Database migration
npm run db:push

# Start local dev
npm run dev
```

## 🔧 TROUBLESHOOTING

### Erro Database
- Verificar `DATABASE_URL` na Vercel
- Executar `npm run db:push` após deploy

### Erro Session
- Verificar `SESSION_SECRET` (min 32 chars)
- Limpar cookies do navegador

### Erro Asaas
- Verificar `ASAAS_API_KEY`
- Confirmar `ASAAS_SANDBOX=false`

## 📞 CONTATO

**Admin**: chpsalgado@hotmail.com | Senha: 123456

---

✅ **APLICAÇÃO PRONTA PARA DEPLOY!**