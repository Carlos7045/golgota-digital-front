# 🔧 TROUBLESHOOTING VERCEL - TOKEN JWT

## 🚨 **PROBLEMA CRÍTICO**
Token JWT não está sendo enviado na resposta JSON do login.

## 🔍 **INVESTIGAÇÃO**

### **Sintomas:**
- Login retorna 200 OK
- Resposta contém: user, profile, roles, force_password_change
- **Token AUSENTE** na resposta JSON
- /api/profile retorna 401 (token não encontrado)

### **Testes Realizados:**
```bash
# Login OK - mas sem token
curl -X POST /api/auth/login → 200 OK
{"user":{...},"profile":{...},"roles":[...]} # SEM TOKEN

# Profile 401 - esperado sem token
curl -X GET /api/profile → 401 Unauthorized
```

### **Código do Servidor:**
```javascript
// Token sendo gerado corretamente
const token = jwt.sign({...}, JWT_SECRET, { expiresIn: '24h' });

// Resposta JSON DEVERIA incluir token
res.json({
  user: {...},
  profile: {...},
  roles: [...],
  token: token, // ← DEVE estar aqui
  message: '...'
});
```

## 🔧 **INVESTIGAÇÃO ATIVA**

### **Logs Adicionados:**
- ✅ Token gerado
- ✅ Token type e length
- ✅ Objeto de resposta verificado
- ✅ Chaves do objeto listadas

### **Hipóteses:**
1. **Middleware interferindo** - removendo token da resposta
2. **Serialização JSON** - problema na conversão
3. **Middleware CORS** - filtrando propriedades
4. **Error handler** - interceptando resposta

## 🎯 **PRÓXIMOS PASSOS**

1. Verificar logs detalhados do servidor
2. Testar resposta JSON diretamente
3. Verificar se há middleware interferindo
4. Implementar fallback com cookie-only

**Status:** Em investigação ativa