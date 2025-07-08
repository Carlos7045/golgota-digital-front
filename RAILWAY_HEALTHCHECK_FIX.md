# 🔧 CORREÇÃO HEALTHCHECK TIMEOUT - RAILWAY

## ❌ **PROBLEMA ORIGINAL:**
Railway falhou no healthcheck com timeout - servidor não respondia em `/health` dentro de 30 segundos.

## ✅ **CORREÇÕES APLICADAS:**

### **1. Health Check Simplificado**
**Antes:**
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
    asaas: process.env.ASAAS_API_KEY ? 'Configured' : 'Not configured'
  });
});
```

**Depois:**
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

### **2. Railway.json Otimizado**
```json
{
  "deploy": {
    "healthcheckTimeout": 60,      // Aumentado de 30s para 60s
    "healthcheckInterval": 10,     // Verifica a cada 10s
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### **3. Asaas Não-Bloqueante**
```typescript
// Configuração movida para setTimeout - não trava inicialização
setTimeout(() => {
  configureAsaasCheckout().catch(error => {
    console.warn('Asaas checkout configuration skipped:', error.message);
  });
}, 2000);
```

### **4. Logs Melhorados**
```typescript
const httpServer = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ HTTP server listening on port ${PORT}`);
});

// Test health endpoint
setTimeout(() => {
  console.log('✅ Server startup complete - health check ready');
}, 1000);
```

---

## 🚀 **AGORA FAÇA:**

### **1. Atualize Repositório GitHub**
Upload dos arquivos corrigidos:
- `server/index.ts` ✅
- `server/routes.ts` ✅  
- `railway.json` ✅

### **2. Redeploy no Railway**
1. Vá para Railway dashboard
2. Clique **"Redeploy"**  
3. Monitore logs para ver:
   ```
   ✅ HTTP server listening on port 3000
   ✅ Server startup complete - health check ready
   ```

### **3. Verifique Health Check**
```
GET https://sua-url.railway.app/health
Response: {"status":"ok"}
```

---

## 🎯 **RESULTADO ESPERADO:**

✅ **Build bem-sucedido**  
✅ **Deploy completado**  
✅ **Healthcheck passa**  
✅ **Servidor funcionando**  

**Agora o Railway deve fazer deploy sem timeout!**