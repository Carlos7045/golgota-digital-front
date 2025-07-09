# 🚀 GUIA DE DEPLOY NA VERCEL - COMANDO GÓLGOTA

## 📋 PRÉ-REQUISITOS

### 1. Conta na Vercel
- Acesse: https://vercel.com
- Faça login com GitHub/GitLab/Bitbucket

### 2. Banco de Dados PostgreSQL
- **Opção 1 - Neon (Recomendado)**
  - Acesse: https://neon.tech
  - Crie uma conta gratuita
  - Crie um novo projeto
  - Copie a `DATABASE_URL`

- **Opção 2 - Supabase**
  - Acesse: https://supabase.com
  - Crie projeto PostgreSQL
  - Copie a connection string

### 3. API Keys Necessárias
- **Asaas Payment Gateway**
  - Acesse: https://asaas.com
  - Obtenha sua API Key
  - Para produção: use ASAAS_SANDBOX=false

## 🔧 CONFIGURAÇÃO DO PROJETO

### 1. Preparar Repositório Git
```bash
git init
git add .
git commit -m "Deploy setup for Vercel"
git remote add origin https://github.com/seu-usuario/comando-golgota.git
git push -u origin main
```

### 2. Configurar Variáveis de Ambiente
No painel da Vercel, adicione essas variáveis:

```env
# Database
DATABASE_URL=postgresql://user:password@hostname:port/database

# Session Security
SESSION_SECRET=sua-chave-secreta-super-forte-aqui

# Asaas Payment
ASAAS_API_KEY=sua-chave-api-asaas-aqui
ASAAS_SANDBOX=false

# Environment
NODE_ENV=production
```

## 🚀 PROCESSO DE DEPLOY

### 1. Conectar Projeto na Vercel
1. Acesse: https://vercel.com/dashboard
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure as seguintes opções:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### 2. Configurar Variáveis de Ambiente
1. Vá para "Settings" > "Environment Variables"
2. Adicione todas as variáveis listadas acima
3. Salve as configurações

### 3. Configurar Database Schema
Após o primeiro deploy, execute:
```bash
npm run db:push
```

### 4. Deploy Automático
- Cada push para `main` fará deploy automático
- Vercel detectará mudanças e rebuildar

## 📁 ESTRUTURA DE ARQUIVOS CRIADOS

```
projeto/
├── api/
│   ├── index.js          # Servidor Express para Vercel
│   └── avatars.js        # Servir avatares
├── vercel.json           # Configuração da Vercel
├── build-vercel.js       # Script de build customizado
├── .env.example          # Exemplo de variáveis
└── vercel-setup.md       # Este guia
```

## 🔒 SEGURANÇA

### 1. Variáveis Sensíveis
- Nunca commite arquivos `.env`
- Use apenas variáveis de ambiente da Vercel
- Mantenha DATABASE_URL segura

### 2. Session Security
- Use SESSION_SECRET forte (min 32 caracteres)
- Configure cookies secure para HTTPS

### 3. CORS Configuration
- Configurado para domínios Vercel
- Permite credenciais para autenticação

## 📊 MONITORAMENTO

### 1. Logs da Vercel
- Acesse "Functions" > "View Function Logs"
- Monitore erros e performance

### 2. Database Monitoring
- Use ferramentas do provider (Neon/Supabase)
- Monitore conexões e queries

### 3. Performance
- Vercel Analytics automático
- Monitor de uptime incluído

## 🛠️ TROUBLESHOOTING

### Erro: "Module not found"
```bash
npm install
npm run build:vercel
```

### Erro: "Database connection failed"
1. Verifique `DATABASE_URL` nas variáveis
2. Teste conexão local
3. Verifique firewall do database

### Erro: "Session not working"
1. Verifique `SESSION_SECRET`
2. Confirme configuração de cookies
3. Teste em modo incógnito

### Erro: "Asaas payment failed"
1. Verifique `ASAAS_API_KEY`
2. Confirme `ASAAS_SANDBOX=false` para produção
3. Teste webhooks

## 📝 COMANDOS ÚTEIS

```bash
# Deploy local test
npm run build:vercel

# Database operations
npm run db:push

# Logs da Vercel
vercel logs

# Redeploy
vercel --prod
```

## 🔄 ATUALIZAÇÕES

### Deploy Automático
1. Faça mudanças no código
2. Commit e push para `main`
3. Vercel detecta e redeploya automaticamente

### Deploy Manual
```bash
git add .
git commit -m "Update: descrição da mudança"
git push origin main
```

## 🌐 DOMÍNIO PERSONALIZADO

### 1. Configurar Domínio
1. Vá para "Settings" > "Domains"
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (24-48h)

### 2. SSL Automático
- Vercel configura SSL automaticamente
- Certificados renováveis automaticamente

## 📱 CONSIDERAÇÕES FINAIS

- **Região**: Configurado para `gru1` (São Paulo)
- **Runtime**: Node.js 18.x
- **Timeout**: 10 segundos (padrão Vercel)
- **Memory**: 1024MB (padrão Vercel)

### Suporte
- Documentação: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Discord: https://vercel.com/discord

---

**✅ PRONTO PARA DEPLOY!** 

Siga este guia passo a passo e terá sua aplicação Comando Gólgota funcionando perfeitamente na Vercel!