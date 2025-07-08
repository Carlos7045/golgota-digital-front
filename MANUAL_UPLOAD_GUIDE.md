# 📤 GUIA DE UPLOAD MANUAL - GITHUB

## 🎯 **SOLUÇÃO: UPLOAD MANUAL DOS ARQUIVOS**

Como o git push está com timeout, vamos fazer upload manual:

### **OPÇÃO 1: Upload via Interface GitHub (RECOMENDADO)**

1. **Acesse seu repositório:**
   https://github.com/Carlos7045/comando-golgota-backend

2. **Clique em "uploading an existing file"**

3. **Arraste todos estes arquivos:**
   - `README.md`
   - `package.json` 
   - `railway.json`
   - `drizzle.config.ts`
   - `tsconfig.json`
   - `.gitignore`

4. **Criar pastas e upload:**
   - Crie pasta `server/` e arraste todos arquivos de `server/`
   - Crie pasta `shared/` e arraste arquivo `shared/schema.ts`

### **OPÇÃO 2: Usar GitHub Desktop**

1. Baixe GitHub Desktop: https://desktop.github.com
2. Clone o repositório vazio
3. Copie todos os arquivos para a pasta local
4. Commit e Push via interface

---

## 📁 **ARQUIVOS PARA UPLOAD**

### **Raiz do projeto:**
```
README.md
package.json          ⭐ MAIS IMPORTANTE
railway.json          ⭐ MAIS IMPORTANTE  
drizzle.config.ts
tsconfig.json
.gitignore
```

### **Pasta server/:**
```
server/index.ts       ⭐ MAIS IMPORTANTE
server/routes.ts      ⭐ MAIS IMPORTANTE
server/db.ts
server/asaas.ts
server/storage.ts
server/vite.ts
```

### **Pasta shared/:**
```
shared/schema.ts      ⭐ MAIS IMPORTANTE
```

---

## ✅ **VERIFICAÇÃO FINAL**

Após upload, seu repositório deve ter esta estrutura:

```
comando-golgota-backend/
├── README.md
├── package.json          ⭐ 
├── railway.json          ⭐
├── drizzle.config.ts
├── tsconfig.json
├── .gitignore
├── server/
│   ├── index.ts          ⭐
│   ├── routes.ts         ⭐
│   ├── db.ts
│   ├── asaas.ts
│   ├── storage.ts
│   └── vite.ts
└── shared/
    └── schema.ts         ⭐
```

---

## 🚂 **APÓS UPLOAD: DEPLOY RAILWAY**

1. **Acesse Railway:** https://railway.app
2. **New Project** → Deploy from GitHub repo
3. **Selecione:** comando-golgota-backend
4. **Configure variáveis:**
   ```
   DATABASE_URL=postgresql://neondb_owner:npg_DuS0iyRwtF7Z@ep-sparkling-snowflake-ae3u4svw.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
   SESSION_SECRET=minha_chave_secreta_super_forte_123456789
   NODE_ENV=production
   ```

---

## 🎯 **RESULTADO ESPERADO**

✅ Build bem-sucedido no Railway  
✅ Servidor backend funcionando  
✅ Health check respondendo: `/health`  
✅ WebSocket disponível: `/ws`  

**O important é ter os arquivos marcados com ⭐ no repositório!**