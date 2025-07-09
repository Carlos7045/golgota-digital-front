# 🔧 VERCEL SESSION DEBUG

## ❌ **PROBLEMA IDENTIFICADO**

**Erro 401 após login:** A sessão não está sendo mantida entre o login e as chamadas subsequentes da API.

## 🛠️ **CORREÇÕES IMPLEMENTADAS**

### 1. **Configuração de Sessão Simplificada**
```javascript
// Session configurada para Vercel serverless
app.use(session({
  secret: process.env.SESSION_SECRET || 'comando-golgota-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // Temporariamente false para debug
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  name: 'golgota-session'
}));
```

### 2. **Logs de Debug Detalhados**
- ✅ Logs no login process
- ✅ Logs na deserialização de usuários  
- ✅ Logs no middleware de autenticação
- ✅ Logs na rota de perfil

### 3. **Middleware de Auth Melhorado**
- ✅ Debug detalhado da sessão
- ✅ Verificação de `req.user`
- ✅ Log do `sessionID`

## 🧪 **FLUXO DE TESTE**

### 1. **Login**
```
POST https://comandogolgota.com.br/api/auth/login
{
  "emailOrCpf": "chpsalgado@hotmail.com",
  "password": "123456"
}
```

**Logs esperados:**
```
🔐 Tentativa de login recebida...
🔍 Tentativa de login: chpsalgado@hotmail.com
✅ Usuário encontrado: chpsalgado@hotmail.com
✅ Login bem-sucedido
🔐 Fazendo login do usuário: chpsalgado@hotmail.com
✅ Login realizado com sucesso
Session ID: sess_123...
User em sessão: chpsalgado@hotmail.com
```

### 2. **Profile**
```
GET https://comandogolgota.com.br/api/profile
```

**Logs esperados:**
```
🔐 Verificando autenticação...
Session ID: sess_123...
User: chpsalgado@hotmail.com
Authenticated: true
✅ Usuário autenticado: chpsalgado@hotmail.com
📋 Buscando perfil para usuário: user_id_123
✅ Perfil encontrado: Carlos Henrique Pereira Salgado
```

## 🔍 **POSSÍVEIS CAUSAS DO PROBLEMA**

### 1. **Cookie Secure**
- ❌ `secure: true` em produção pode bloquear cookies
- ✅ Mudado para `false` temporariamente

### 2. **SameSite Policy**
- ❌ `sameSite: 'none'` pode causar problemas
- ✅ Mudado para `'lax'`

### 3. **Session Store**
- ❌ Memory store não persiste entre chamadas serverless
- 🔄 Mantido para simplicidade inicial

## 📊 **MONITORAMENTO**

### **No Runtime Logs da Vercel:**
1. Fazer login
2. Verificar logs de sessão
3. Tentar acessar `/api/profile`
4. Verificar se sessão é mantida

### **Indicadores de Sucesso:**
- ✅ Session ID mantido entre chamadas
- ✅ `req.user` populado corretamente
- ✅ `req.isAuthenticated()` retorna true
- ✅ Profile carrega sem erro 401

## 🎯 **PRÓXIMOS PASSOS**

1. Deploy das correções
2. Teste do fluxo completo
3. Verificação dos logs
4. Se funcionar: reativar `secure: true` gradualmente

**🚀 Aguarde o redeploy e teste novamente!**