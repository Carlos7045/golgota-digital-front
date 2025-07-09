# 🔐 TESTE DE LOGIN - COMANDO GÓLGOTA

## 📋 **INSTRUÇÕES PARA TESTE**

### **Credenciais de Administrador:**
- **Email:** chpsalgado@hotmail.com
- **Senha:** 123456

### **Passo a Passo:**

1. **Acessar a Landing Page:**
   - Aplicação carrega em `http://localhost:5000/`
   - Deve mostrar a página do Comando Gólgota

2. **Fazer Login:**
   - Clicar no botão "Entrar" no header
   - Isso deve levar para `/auth`
   - Inserir credenciais: chpsalgado@hotmail.com / 123456
   - Clicar em "Entrar"

3. **Resultado Esperado:**
   - Login bem-sucedido
   - Redirecionamento automático para `/comunidade`
   - Acesso à área da comunidade com canais

### **Testes de API:**
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrCpf":"chpsalgado@hotmail.com","password":"123456"}' \
  -c cookies.txt

# Profile
curl -X GET http://localhost:5000/api/profile -b cookies.txt
```

### **Fluxo de Autenticação:**
1. Landing page → Header "Entrar" → `/auth`
2. Login → Cookies salvos → Redirecionamento `/comunidade`
3. ProtectedRoute → Verificação → Acesso liberado

**⚠️ IMPORTANTE:** Se estiver vendo apenas a landing page, é porque o login não foi realizado ou o redirecionamento não está funcionando.