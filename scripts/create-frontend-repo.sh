#!/bin/bash

# Script para criar repositório frontend separado
# Uso: ./scripts/create-frontend-repo.sh [diretorio-destino]

set -e

DEST_DIR=${1:-../comando-golgota-frontend}

echo "🎨 Criando repositório frontend para Vercel..."

# Verificar se diretório já existe
if [ -d "$DEST_DIR" ]; then
    echo "❌ Diretório $DEST_DIR já existe!"
    echo "   Remova ou use outro nome: ./scripts/create-frontend-repo.sh /path/diferente"
    exit 1
fi

# Criar diretório
mkdir -p "$DEST_DIR"
cd "$DEST_DIR"

echo "📁 Copiando arquivos essenciais..."

# Copiar arquivos necessários para frontend
cp -r ../workspace/client ./
cp -r ../workspace/public ./
cp -r ../workspace/shared ./

# Verificar se attached_assets existe
if [ -d "../workspace/attached_assets" ]; then
    cp -r ../workspace/attached_assets ./
    echo "✅ attached_assets copiado"
fi

# Arquivo mais importante: package.json correto
cp ../workspace/package.frontend.json ./package.json
echo "✅ package.frontend.json → package.json"

# Configurações de build
cp ../workspace/vite.config.vercel.ts ./vite.config.ts
cp ../workspace/vercel.json ./

# Configurações de estilo
cp ../workspace/tailwind.config.ts ./
cp ../workspace/postcss.config.js ./
cp ../workspace/components.json ./

# README básico
cat > README.md << 'EOF'
# Comando Gólgota Frontend

Interface web para a plataforma militar comunitária Comando Gólgota.

## Tecnologias
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Radix UI + shadcn/ui
- TanStack Query
- React Router

## Scripts
```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
```

## Deploy
Este frontend é deployado automaticamente no Vercel.

## Variáveis de Ambiente
- `VITE_API_URL` - URL do backend (Railway)
- `VITE_WS_URL` - URL WebSocket do backend

## Estrutura
- `/client/src` - Código fonte React
- `/public` - Assets estáticos
- `/shared` - Tipos e schemas compartilhados
EOF

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build
dist/
build/

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

# Vite
.vite/

# Vercel
.vercel
EOF

# .env.example
cat > .env.example << 'EOF'
# Backend URL (Railway)
VITE_API_URL=https://seu-backend.railway.app

# WebSocket URL (Railway)
VITE_WS_URL=wss://seu-backend.railway.app/ws
EOF

# Verificar se package.json está correto
echo "🔍 Verificando package.json..."
if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8')); console.log('✅ JSON válido')"; then
    echo "✅ Package.json válido para frontend"
else
    echo "❌ Erro no package.json!"
    exit 1
fi

# Verificar se scripts estão corretos
if grep -q '"dev": "vite"' package.json; then
    echo "✅ Script 'dev' configurado"
else
    echo "❌ Script 'dev' não encontrado!"
    exit 1
fi

if grep -q '"build": "vite build"' package.json; then
    echo "✅ Script 'build' configurado"
else
    echo "❌ Script 'build' não encontrado!"
    exit 1
fi

echo ""
echo "🎉 Repositório frontend criado com sucesso!"
echo ""
echo "📍 Localização: $DEST_DIR"
echo ""
echo "🔥 Próximos passos:"
echo "1. cd $DEST_DIR"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Frontend inicial para Vercel'"
echo "5. git remote add origin https://github.com/seu-usuario/comando-golgota-frontend.git"
echo "6. git push -u origin main"
echo "7. Deploy no Vercel: https://vercel.com"
echo ""
echo "🌐 Variáveis de ambiente necessárias no Vercel:"
echo "   VITE_API_URL=https://seu-backend.railway.app"
echo "   VITE_WS_URL=wss://seu-backend.railway.app/ws"