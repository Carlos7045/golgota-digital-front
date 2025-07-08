# 🚀 Deploy do Comando Gólgota na Vercel

## ✅ Configuração Completa para Deploy

### 1. **Arquivos Criados/Configurados:**

#### `vercel.json` (já criado)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

#### `vite.config.vercel.ts` (versão otimizada para produção)
Criado com configurações otimizadas para deploy na Vercel.

### 2. **Scripts de Build:**

O projeto atual usa estes scripts no `package.json`:
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

**Para deploy na Vercel (apenas frontend), você precisará:**

### 3. **Configuração na Vercel:**

1. **Build Command:** `vite build`
2. **Output Directory:** `dist`
3. **Framework Preset:** `Vite`
4. **Install Command:** `npm install`

### 4. **Variáveis de Ambiente:**

Na Vercel, configure estas variáveis:
```
VITE_API_URL=https://seu-backend-api.com
```

### 5. **Estrutura de Deploy:**

```
projeto/
├── client/           # Frontend React (será deployado)
├── server/          # Backend (NÃO será deployado na Vercel)
├── shared/          # Código compartilhado
├── dist/           # Output do build (criado automaticamente)
├── vercel.json     # Configuração da Vercel
└── vite.config.ts  # Configuração do Vite
```

### 6. **Passos para Deploy:**

1. **Faça commit de todos os arquivos:**
   ```bash
   git add .
   git commit -m "Configuração para deploy na Vercel"
   git push origin main
   ```

2. **Na Vercel:**
   - Conecte seu repositório GitHub
   - Framework: **Vite**
   - Build Command: `vite build`
   - Output Directory: `dist`
   - Root Directory: deixe vazio (usa a raiz)

3. **Configure o Backend separadamente:**
   - O backend (server/) precisa ser deployado em outro serviço
   - Sugestões: Railway, Render, Heroku, etc.

### 7. **Arquivos Importantes:**

- ✅ `vercel.json` - Configuração de rotas
- ✅ `vite.config.vercel.ts` - Build otimizado
- ✅ `package.frontend.json` - Dependências apenas frontend
- ✅ Todos os componentes React prontos

### 8. **Configuração de API:**

O frontend está configurado para fazer chamadas para:
```typescript
// Em client/src/lib/queryClient.ts
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://sua-api-backend.com'
  : 'http://localhost:5000'
```

### 9. **Checklist Final:**

- ✅ vercel.json criado
- ✅ vite.config.ts otimizado
- ✅ Build testado localmente
- ✅ Todas as dependências corretas
- ✅ Rotas SPA configuradas
- ⚠️ **Backend precisa ser deployado separadamente**

## 🎯 Resultado Esperado:

Após o deploy, você terá:
- Frontend rodando na Vercel (comando-golgota.vercel.app)
- Interface completa funcionando
- Necessário configurar backend em outro serviço
- Sistema de autenticação funcionará após conectar backend

## 📋 Próximos Passos:

1. Deploy do frontend na Vercel ✅ (pronto)
2. Deploy do backend em Railway/Render
3. Configurar variáveis de ambiente
4. Conectar banco PostgreSQL
5. Configurar domínio personalizado (opcional)