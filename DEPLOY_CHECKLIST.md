# ✅ CHECKLIST DE DEPLOY

## 🎯 **VERCEL (Frontend)**

### **GitHub Sync:**
- [ ] Commit login real implementado
- [ ] Commit configurações de produção
- [ ] Push para repositório principal

### **Variáveis de Ambiente:**
```env
VITE_API_URL=https://comando-golgota-backend-production.up.railway.app
VITE_WS_URL=wss://comando-golgota-backend-production.up.railway.app/ws
```

### **Arquivos Críticos Atualizados:**
- [ ] `client/src/pages/Login.tsx` - Login real
- [ ] `client/src/lib/api.ts` - API configurada
- [ ] `.env.example` - Variáveis documentadas

---

## 🚂 **RAILWAY (Backend)**

### **Repositório Separado:**
- [ ] Atualizar `server/index.ts` com CORS corrigido
- [ ] Atualizar `server/routes.ts` com login emailOrCpf
- [ ] Commit e push no repositório Railway

### **Variáveis de Ambiente:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=comando-golgota-secret-2025
NODE_ENV=production
```

### **Arquivos Essenciais:**
- [ ] `server/index.ts` - CORS + Health check
- [ ] `server/routes.ts` - Login + APIs
- [ ] `server/db.ts` - Database connection
- [ ] `server/storage.ts` - Data operations

---

## 🧪 **TESTES PÓS-DEPLOY**

### **Backend Railway:**
- [ ] Health check: `/health`
- [ ] Login API: `/api/auth/login`
- [ ] Profile API: `/api/profile`

### **Frontend Vercel:**
- [ ] Página inicial carregando
- [ ] Login redirecionando para `/login`
- [ ] Login funcionando com credenciais
- [ ] Dashboard acessível após login

### **Integração:**
- [ ] Frontend consegue chamar backend
- [ ] Sessões funcionando
- [ ] WebSocket conectando
- [ ] Dados reais carregando

---

## 🚀 **CREDENCIAIS DE TESTE**

```
Email: chpsalgado@hotmail.com
Senha: 123456
```

**Usuário Admin com acesso completo.**

---

## 📞 **SUPORTE**

Se algo não funcionar:
1. Verifique logs do Railway
2. Verifique console do navegador
3. Teste APIs individualmente
4. Confirme variáveis de ambiente