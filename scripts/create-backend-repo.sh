#!/bin/bash

# Script para criar repositório backend separado
# Uso: ./scripts/create-backend-repo.sh [diretorio-destino]

set -e

DEST_DIR=${1:-../comando-golgota-backend}

echo "🚀 Criando repositório backend para Railway..."

# Verificar se diretório já existe
if [ -d "$DEST_DIR" ]; then
    echo "❌ Diretório $DEST_DIR já existe!"
    echo "   Remova ou use outro nome: ./scripts/create-backend-repo.sh /path/diferente"
    exit 1
fi

# Criar diretório
mkdir -p "$DEST_DIR"
cd "$DEST_DIR"

echo "📁 Copiando arquivos essenciais..."

# Copiar arquivos necessários para backend
cp -r ../workspace/server ./
cp -r ../workspace/shared ./

# Arquivo mais importante: package.json correto
cp ../workspace/package.backend.json ./package.json
echo "✅ package.backend.json → package.json"

# Configurações de deploy
cp ../workspace/railway.json ./
cp ../workspace/Dockerfile.railway ./Dockerfile
cp ../workspace/.env.railway ./.env.example

# Configurações de desenvolvimento
cp ../workspace/drizzle.config.ts ./
cp ../workspace/tsconfig.json ./

# README básico
cat > README.md << 'EOF'
# Comando Gólgota Backend

Backend API para a plataforma militar comunitária Comando Gólgota.

## Tecnologias
- Node.js + Express.js
- TypeScript
- PostgreSQL (Neon)
- WebSocket (ws)
- Drizzle ORM

## Scripts
```bash
npm run build    # Build para produção
npm run start    # Iniciar servidor
npm run dev      # Desenvolvimento
npm run db:push  # Aplicar migrations
```

## Deploy
Este backend é deployado automaticamente no Railway.app

## Variáveis de Ambiente
- `DATABASE_URL` - URL do PostgreSQL
- `SESSION_SECRET` - Chave secreta das sessões
- `NODE_ENV` - Ambiente (production)
- `ASAAS_API_KEY` - Chave API Asaas (opcional)

## Health Check
- Endpoint: `/health`
- WebSocket: `/ws`
EOF

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build
dist/

# Environment
.env
.env.local
.env.production

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Logs
logs/
*.log

# Temp
.tmp/
temp/

# Runtime
*.pid
*.seed
*.pid.lock
EOF

# Verificar se package.json está correto
echo "🔍 Verificando package.json..."
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ JSON válido')"; then
    echo "✅ Package.json válido para backend"
else
    echo "❌ Erro no package.json!"
    exit 1
fi

# Verificar se scripts estão corretos
if grep -q '"start": "node dist/index.js"' package.json; then
    echo "✅ Script 'start' configurado"
else
    echo "❌ Script 'start' não encontrado!"
    exit 1
fi

if grep -q '"build": "esbuild server/index.ts' package.json; then
    echo "✅ Script 'build' configurado"
else
    echo "❌ Script 'build' não encontrado!"
    exit 1
fi

echo ""
echo "🎉 Repositório backend criado com sucesso!"
echo ""
echo "📍 Localização: $DEST_DIR"
echo ""
echo "🔥 Próximos passos:"
echo "1. cd $DEST_DIR"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Backend inicial para Railway'"
echo "5. git remote add origin https://github.com/seu-usuario/comando-golgota-backend.git"
echo "6. git push -u origin main"
echo "7. Deploy no Railway: https://railway.app"
echo ""
echo "🌐 Variáveis de ambiente necessárias no Railway:"
echo "   DATABASE_URL=postgresql://..."
echo "   SESSION_SECRET=chave_secreta_min_32_chars"
echo "   NODE_ENV=production"