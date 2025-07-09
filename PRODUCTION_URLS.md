# 🌐 URLs de Produção - Comando Gólgota

## ✅ **URLs Finais de Produção**

### **Frontend (Vercel)**
- **URL Principal**: `https://golgota-digital-front-9deh-kfymuqu5d-carlos-salgados-projects.vercel.app/`
- **Domínio Customizado**: `https://golgota-digital-front-9k4h.vercel.app` (alternativo)

### **Backend (Railway)**
- **URL da API**: `https://comando-golgota-backend-production.up.railway.app`
- **Health Check**: `https://comando-golgota-backend-production.up.railway.app/health`

### **Banco de Dados (Neon)**
- **Banco**: Same as Replit development (shared database)
- **Connection**: PostgreSQL via Neon serverless

## 🔧 **Configuração Atual**

### **Variáveis Railway**
```env
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
SESSION_SECRET=bec502541024ed0e7e22864d1ba2a00ef496e1e1e8277327c6137cc360b8cf12
ASAAS_API_KEY=<your-asaas-api-key>
ASAAS_SANDBOX=true
NODE_ENV=production
PORT=5000
```

### **Variáveis Vercel**
```env
VITE_API_BASE_URL=https://comando-golgota-backend-production.up.railway.app
```

## 🧪 **Testes de Validação**

### **1. Backend Health Check**
```bash
curl https://comando-golgota-backend-production.up.railway.app/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-07-09T...",
  "environment": "production",
  "database": "Connected",
  "sessionSecret": "Configured",
  "asaas": "Configured",
  "port": "5000"
}
```

### **2. Frontend Loading**
- Acesse: `https://golgota-digital-front-9deh-kfymuqu5d-carlos-salgados-projects.vercel.app/`
- Verifique se a página carrega sem erros CORS
- Teste login com usuário existente

### **3. API Integration**
- Login deve funcionar
- Dashboard deve carregar dados
- Não deve haver erros 401/500

## 🔄 **Próximos Passos**

1. **Configure ASAAS_API_KEY** no Railway com chave real
2. **Teste health check** após configuração
3. **Teste login completo** no frontend
4. **Verifique logs** no Railway para confirmar funcionamento

## 📋 **Troubleshooting**

### **Se Backend não responder**
1. Verifique logs no Railway Dashboard
2. Confirme se todas as variáveis estão corretas
3. Teste health check endpoint

### **Se Frontend não conectar**
1. Verifique console do navegador para erros CORS
2. Confirme VITE_API_BASE_URL no Vercel
3. Teste comunicação direta com a API

### **Se houver erro de Database**
1. Verifique se DATABASE_URL está correta
2. Confirme conexão com Neon
3. Verifique logs de database no Railway

## 🎯 **Status da Implementação**

- [x] Backend deployado no Railway
- [x] Frontend deployado no Vercel
- [x] Banco de dados Neon configurado
- [x] CORS configurado
- [x] Health check implementado
- [x] Variáveis de ambiente configuradas
- [ ] ASAAS_API_KEY configurada (pendente)
- [ ] Teste completo da aplicação