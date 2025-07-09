# 🚀 Configuração de Produção - Comando Gólgota

## ⚠️ PROBLEMAS IDENTIFICADOS E SOLUÇÕES

### 1. 🗄️ **Configurar Database no Railway**

**PROBLEMA**: DATABASE_URL com placeholder
**SOLUÇÃO**:
1. No Railway Dashboard:
   - Clique em **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Após criar, vá em **Variables** → **DATABASE_URL**
   - Copie a URL real (ex: `postgresql://postgres:password@junction.proxy.rlwy.net:5432/railway`)

### 2. 🔐 **Gerar SESSION_SECRET Real**

**PROBLEMA**: SESSION_SECRET com placeholder
**SOLUÇÃO**: Execute e copie o resultado:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Exemplo gerado: `a7f4b2c8d1e9f3a6b5c2d8e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6a9b2c5d8e1f4a7b0c3`

### 3. 💳 **Configurar ASAAS_API_KEY**

**PROBLEMA**: ASAAS_API_KEY com placeholder

**OPÇÕES**:
- **Para produção**: Use sua API key real do Asaas
- **Para testes**: Mantenha `ASAAS_SANDBOX=true` e use key de sandbox

### 4. 🌐 **Verificar URL do Frontend**

**No Vercel**: A URL correta do seu projeto é:
`https://golgota-digital-front-9k4h.vercel.app`

## 📝 **VARIÁVEIS CORRETAS PARA RAILWAY**

```env
DATABASE_URL=postgresql://postgres:BVfpKSumSMziFHxCVRUoFOmOPkYHacxL@postgres.railway.internal:5432/railway
SESSION_SECRET=bec502541024ed0e7e22864d1ba2a00ef496e1e1e8277327c6137cc360b8cf12
ASAAS_API_KEY=sua_api_key_real_do_asaas
ASAAS_SANDBOX=true
NODE_ENV=production
PORT=5000
```

## 📝 **VARIÁVEIS CORRETAS PARA VERCEL**

```env
VITE_API_BASE_URL=https://comando-golgota-backend-production.up.railway.app
```

## 🔧 **PASSOS PARA CORRIGIR**

### **No Railway:**
1. **Database**: Adicionar PostgreSQL service
2. **Variables**: Substituir todos os placeholders pelos valores reais
3. **Deploy**: Fazer novo deploy após configurar

### **No Vercel:**
1. **Environment Variables**: Verificar se VITE_API_BASE_URL está correto
2. **Redeploy**: Fazer redeploy após mudanças

## ✅ **COMO TESTAR**

1. **Backend Health Check**:
   ```bash
   curl https://comando-golgota-backend-production.up.railway.app/health
   ```

2. **Frontend funcionando**:
   - Acesse: `https://golgota-digital-front-9k4h.vercel.app`
   - Teste login com usuário existente

## 🎯 **ORDEM DE EXECUÇÃO**

1. ✅ Configurar database no Railway
2. ✅ Gerar e configurar SESSION_SECRET
3. ✅ Configurar ASAAS_API_KEY (se necessário)
4. ✅ Fazer redeploy no Railway
5. ✅ Testar endpoints do backend
6. ✅ Testar frontend completo

## 🆘 **Se ainda houver problemas**

- **Logs Railway**: Verificar em Build Logs/Deploy Logs
- **Console Browser**: Verificar erros CORS
- **Network**: Verificar se requests chegam ao backend