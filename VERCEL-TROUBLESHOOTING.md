# 🚨 TROUBLESHOOTING - VERCEL DEPLOY ISSUES

## 🔍 **PROBLEMAS IDENTIFICADOS**

### 1. **APIs retornando HTML em vez de JSON**
- **Sintoma**: `SyntaxError: Unexpected token '<', "<!DOCTYPE html>" is not valid JSON`
- **Causa**: Vercel não está direcionando corretamente para as funções API
- **Solução**: Verificar configuração no `vercel.json`

### 2. **Erro 405 (Method Not Allowed)**
- **Sintoma**: `POST /api/auth/login 405 (Method Not Allowed)`
- **Causa**: Função serverless não está recebendo requisições POST
- **Solução**: Atualizar configuração de rotas

### 3. **Problemas de CORS**
- **Sintoma**: Múltiplos erros de CORS no console
- **Causa**: Configuração incorreta de origins
- **Solução**: Ajustar CORS para comandogolgota.com.br

## 🛠️ **SOLUÇÕES IMEDIATAS**

### 1. **Atualizar Variáveis de Ambiente**

**❌ REMOVER estas variáveis desnecessárias:**
- `VITE_WS_URL`
- `NEXT_PUBLIC_API_URL`

**✅ MANTER apenas estas:**
```env
NODE_ENV=production
SESSION_SECRET=comando-golgota-super-secret-key-2024-production
DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
ASAAS_API_KEY=sua-chave-asaas-aqui
ASAAS_SANDBOX=false
```

### 2. **Atualizar Arquivo API**

Substitua o conteúdo de `api/index.js` pelo arquivo `api/index-fixed.js`:

```bash
cp api/index-fixed.js api/index.js
```

### 3. **Verificar Build da Vercel**

No painel da Vercel, vá para:
- **Deployments** > **Latest Build**
- Verificar se há erros no build
- Redeployar se necessário

## 🎯 **TESTE RÁPIDO**

### 1. **Testar API Health**
```bash
curl https://comandogolgota.com.br/api/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-08T...",
  "environment": "production"
}
```

### 2. **Testar Login**
```bash
curl -X POST https://comandogolgota.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrCpf": "chpsalgado@hotmail.com", "password": "123456"}'
```

**Resposta esperada:**
```json
{
  "user": {
    "id": 1,
    "name": "Carlos Henrique",
    "email": "chpsalgado@hotmail.com",
    "rank": "admin"
  },
  "message": "Login realizado com sucesso"
}
```

## 🔧 **CONFIGURAÇÃO VERCEL**

### 1. **Build Settings**
```
Framework Preset: Other
Build Command: node build-vercel.js
Output Directory: dist/public
Install Command: npm install
```

### 2. **Functions Settings**
```
Node.js Version: 18.x
Memory: 1024 MB
Max Duration: 10s
```

### 3. **Domains Settings**
```
Production: comandogolgota.com.br
www: www.comandogolgota.com.br
```

## 🚀 **REDEPLOY PROCESS**

### 1. **Fazer correções no código**
```bash
# Atualizar api/index.js
# Corrigir variáveis de ambiente
# Verificar vercel.json
```

### 2. **Commit e Push**
```bash
git add .
git commit -m "Fix: API routes and CORS configuration"
git push origin main
```

### 3. **Verificar Deploy**
- Acessar Vercel Dashboard
- Aguardar build completar
- Testar endpoints

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### Antes do Deploy:
- [ ] Variáveis de ambiente corretas
- [ ] Arquivo `api/index.js` atualizado
- [ ] Build local funcionando
- [ ] Testes de API passando

### Após Deploy:
- [ ] `/api/health` respondendo
- [ ] `/api/auth/login` funcionando
- [ ] Console sem erros de CORS
- [ ] Login no frontend funcionando

## 🔄 **FALLBACK SOLUTION**

Se ainda não funcionar:

### 1. **Redeploy Completo**
```bash
# Na Vercel Dashboard
Deployments > ... > Redeploy
```

### 2. **Verificar Logs**
```bash
# Vercel CLI
vercel logs --follow
```

### 3. **Teste Local**
```bash
# Testar se funciona localmente
npm run build:vercel
node api/index.js
```

---

## 🎯 **PRÓXIMOS PASSOS**

1. **Implementar correções acima**
2. **Testar endpoints básicos**
3. **Gradualmente adicionar funcionalidades**
4. **Monitorar logs da Vercel**

**🚀 Com essas correções, o sistema deveria funcionar perfeitamente na Vercel!**