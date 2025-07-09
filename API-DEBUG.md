# 🔧 API DEBUG - Conectividade com Banco

## ❌ **PROBLEMA IDENTIFICADO**

**Erro 500 na API:** `/api/auth/login` está falhando com erro 500, indicando problema na conexão com o banco de dados.

## 🛠️ **CORREÇÕES IMPLEMENTADAS**

### 1. **Schema Inline**
- ❌ Removida importação externa do schema
- ✅ Schema definido inline no `api/db-vercel.js`
- ✅ Evita problemas de importação ES6/CommonJS

### 2. **Logs de Debug**
- ✅ Adicionados logs detalhados no login
- ✅ Console.log para acompanhar fluxo de autenticação
- ✅ Error handling melhorado

### 3. **Health Check Melhorado**
- ✅ Endpoint `/api/health` agora testa conexão real com banco
- ✅ Busca o usuário admin para verificar conectividade
- ✅ Retorna status detalhado da conexão

## 🧪 **TESTE PASSO A PASSO**

### 1. **Teste de Conectividade**
```
URL: https://comandogolgota.com.br/api/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-08T...",
  "environment": "production",
  "database": "Connected"
}
```

### 2. **Teste de Login**
```
URL: https://comandogolgota.com.br/api/auth/login
Método: POST
Body: {
  "emailOrCpf": "chpsalgado@hotmail.com",
  "password": "123456"
}
```

**Resposta esperada:**
```json
{
  "user": {
    "id": "068b3ef8-...",
    "email": "chpsalgado@hotmail.com"
  },
  "message": "Login realizado com sucesso"
}
```

## 🔍 **COMO VERIFICAR**

### 1. **Verificar Build**
- Aguardar redeploy automático da Vercel
- Verificar se build passou sem erros

### 2. **Testar APIs**
- Primeiro testar `/api/health`
- Se OK, testar login no frontend
- Verificar logs no console da Vercel

### 3. **Logs da Vercel**
- Ver logs em tempo real: `Runtime Logs` no painel
- Procurar por mensagens de debug:
  - `🚀 API iniciando...`
  - `🔍 Tentativa de login:`
  - `✅ Usuário encontrado:`

## 📋 **ESTRUTURA DO BANCO**

```sql
-- Tabela users
users {
  id: uuid (primary key)
  email: text (unique)
  password: text
  created_at: timestamp
  force_password_change: boolean
}

-- Tabela profiles
profiles {
  id: integer (primary key)
  user_id: uuid (references users.id)
  name: text
  cpf: text (unique)
  rank: text
  company: text
  ...
}
```

## 🎯 **RESULTADO ESPERADO**

Com essas correções:
- ✅ API conectará ao banco Neon
- ✅ Login funcionará corretamente
- ✅ Erros 500 serão resolvidos
- ✅ Sistema totalmente operacional

**🚀 Aguarde o redeploy automático e teste novamente!**