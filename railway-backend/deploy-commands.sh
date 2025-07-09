#!/bin/bash

# 🚂 RAILWAY DEPLOY COMMANDS
# Execute estes comandos no repositório Railway

echo "🚂 Preparando deploy Railway..."

# 1. Verificar se os arquivos foram atualizados
echo "📋 Verificando arquivos críticos..."
echo "✅ server/index.ts - $(stat -c%Y server/index.ts)"
echo "✅ server/routes.ts - $(stat -c%Y server/routes.ts)"
echo "✅ server/db.ts - $(stat -c%Y server/db.ts)"

# 2. Testar build local (opcional)
echo "🔨 Testando build..."
npm run build

# 3. Verificar variáveis de ambiente
echo "🔧 Verificando variáveis..."
echo "DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "SESSION_SECRET: ${SESSION_SECRET:0:10}..."
echo "NODE_ENV: $NODE_ENV"

# 4. Deploy
echo "🚀 Fazendo deploy..."
git add .
git commit -m "Update: Login real + CORS + Health check melhorado"
git push origin main

echo "✅ Deploy Railway completed!"
echo "🔗 Acesse: https://comando-golgota-backend-production.up.railway.app/health"