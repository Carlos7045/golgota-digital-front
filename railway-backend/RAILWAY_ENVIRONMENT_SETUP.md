# 🚂 RAILWAY - CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

## ❌ **ERRO ATUAL**
```
DATABASE_URL não configurado
SESSION_SECRET não configurado  
ASAAS_API_KEY não configurado
```

---

## 🔧 **CONFIGURAÇÃO OBRIGATÓRIA**

### **1. Acesse Railway Dashboard**
- Vá para: https://railway.app/dashboard
- Entre no projeto: `comando-golgota-backend`
- Clique em **Variables**

### **2. Configure estas variáveis:**

**DATABASE_URL** (OBRIGATÓRIO)
```
postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**SESSION_SECRET** (OBRIGATÓRIO)
```
comando-golgota-secret-2025-production
```

**NODE_ENV** (OBRIGATÓRIO)
```
production
```

**ASAAS_API_KEY** (OPCIONAL - para pagamentos)
```
sua-chave-asaas-aqui
```

---

## 🚀 **APÓS CONFIGURAR**

1. **Redeploy automático** será triggered
2. **Aguarde** 2-3 minutos para deploy completo
3. **Teste** health check: `/health/detailed`
4. **Teste** login no frontend

---

## ✅ **HEALTH CHECK ESPERADO**

Após configurar, o `/health/detailed` deve retornar:
```json
{
  "status": "ok",
  "environment": "production",
  "checks": {
    "database": "Connected",
    "session": "Configured", 
    "asaas": "Configured"
  },
  "critical_missing": []
}
```

---

## 🎯 **TESTE FINAL**

Login funcionando com:
```
Email: chpsalgado@hotmail.com
Senha: 123456
```

**Sem essas variáveis, o login sempre falhará!**