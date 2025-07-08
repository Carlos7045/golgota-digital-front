# 🚂 INSTRUÇÕES RAILWAY DEPLOY - COMANDO GÓLGOTA

## ✅ **PROBLEMA CORRIGIDO**

Movi `esbuild` e `typescript` para `dependencies` porque o Railway precisa dessas ferramentas para fazer build.

**Antes (ERRO):**
```json
"devDependencies": {
  "esbuild": "^0.25.0",
  "typescript": "5.6.3"
}
```

**Depois (CORRETO):**
```json
"dependencies": {
  "esbuild": "^0.25.0",
  "typescript": "5.6.3"
}
```

---

## 🔧 **DEPLOY NO RAILWAY**

### **PASSO 1: Acessar Railway**
1. Vá para https://railway.app
2. Faça login com GitHub
3. **Delete o deploy anterior** (se existir)

### **PASSO 2: Criar Novo Projeto**
1. Clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha: `comando-golgota-backend`
4. Clique **"Deploy Now"**

### **PASSO 3: Configurar Variáveis de Ambiente**
Após o deploy inicial, configure:

1. Clique na aba **"Variables"**
2. Adicione estas variáveis:

```env
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require

SESSION_SECRET=minha_chave_secreta_super_forte_123456789_abcdef

NODE_ENV=production

ASAAS_API_KEY=sua_chave_asaas_aqui

ASAAS_SANDBOX=false
```

**⚠️ IMPORTANTE:** 
- SESSION_SECRET deve ter no mínimo 32 caracteres
- DATABASE_URL é a URL do Neon (já configurada)
- ASAAS_API_KEY é opcional (se não tiver, deixe em branco)

### **PASSO 4: Verificar Deploy**
1. Railway fará build automaticamente
2. Aguarde até aparecer "✅ Deploy successful"
3. Clique em **"View Logs"** se houver erro

### **PASSO 5: Testar Backend**
1. Copie a URL do projeto (ex: `https://abc123.railway.app`)
2. Teste o health check:
   ```
   https://sua-url.railway.app/health
   ```
3. Deve retornar: `{"status":"ok","timestamp":"..."}`

---

## 🔍 **RESOLUÇÃO DE PROBLEMAS**

### **Se build falhar:**
- Verifique se `esbuild` está em `dependencies` ✅
- Verifique se `typescript` está em `dependencies` ✅
- Veja logs de build na aba "Deployments"

### **Se servidor não iniciar:**
- Verifique se `SESSION_SECRET` está configurado
- Verifique se `DATABASE_URL` está correto
- Veja logs de runtime na aba "Deployments"

### **Se health check falhar:**
- Verifique se o servidor está ouvindo na `PORT` correta
- Railway define automaticamente a porta via `process.env.PORT`

---

## 📱 **URLs DE PRODUÇÃO**

Após deploy bem-sucedido:

**Backend API:** `https://sua-url.railway.app`  
**Health Check:** `https://sua-url.railway.app/health`  
**WebSocket:** `wss://sua-url.railway.app/ws`

---

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ Deploy backend no Railway
2. 🔄 Configurar frontend no Vercel para usar a URL do Railway
3. 🧪 Testar integração completa

**Agora o deploy deve funcionar perfeitamente! 🚀**