#!/bin/bash

# Script para sincronizar código entre repositórios de deploy
# Uso: ./scripts/deploy-sync.sh [frontend|backend|all]

set -e

COMMAND=${1:-all}

echo "🔄 Sincronizando repositórios de deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se diretório existe
check_dir() {
    if [ ! -d "$1" ]; then
        echo -e "${RED}❌ Diretório $1 não encontrado${NC}"
        echo "Execute: mkdir $1 && cd $1 && git clone <repo-url> ."
        exit 1
    fi
}

# Função para sincronizar frontend
sync_frontend() {
    echo -e "${YELLOW}📦 Sincronizando Frontend...${NC}"
    
    check_dir "../comando-golgota-frontend"
    
    cd "../comando-golgota-frontend"
    
    # Copiar arquivos necessários
    cp -r ../workspace/client/* ./client/ 2>/dev/null || cp -r ../workspace/client ./
    cp -r ../workspace/public ./
    cp -r ../workspace/shared ./
    cp ../workspace/package.frontend.json ./package.json
    cp ../workspace/vite.config.vercel.ts ./vite.config.ts
    cp ../workspace/vercel.json ./
    cp ../workspace/tailwind.config.ts ./
    cp ../workspace/postcss.config.js ./
    cp ../workspace/components.json ./
    
    # Commit e push
    git add .
    if git diff --staged --quiet; then
        echo -e "${GREEN}✅ Frontend já está atualizado${NC}"
    else
        git commit -m "Sync frontend from Replit - $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo -e "${GREEN}✅ Frontend sincronizado e enviado${NC}"
    fi
    
    cd - > /dev/null
}

# Função para sincronizar backend
sync_backend() {
    echo -e "${YELLOW}🚂 Sincronizando Backend...${NC}"
    
    check_dir "../comando-golgota-backend"
    
    cd "../comando-golgota-backend"
    
    # Copiar arquivos necessários
    cp -r ../workspace/server ./
    cp -r ../workspace/shared ./
    cp ../workspace/package.backend.json ./package.json
    cp ../workspace/railway.json ./
    cp ../workspace/Dockerfile.railway ./Dockerfile
    cp ../workspace/.env.railway ./.env.example
    cp ../workspace/drizzle.config.ts ./
    cp ../workspace/tsconfig.json ./
    
    # Commit e push
    git add .
    if git diff --staged --quiet; then
        echo -e "${GREEN}✅ Backend já está atualizado${NC}"
    else
        git commit -m "Sync backend from Replit - $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin main
        echo -e "${GREEN}✅ Backend sincronizado e enviado${NC}"
    fi
    
    cd - > /dev/null
}

# Executar baseado no comando
case $COMMAND in
    frontend)
        sync_frontend
        ;;
    backend)
        sync_backend
        ;;
    all)
        sync_frontend
        sync_backend
        ;;
    *)
        echo -e "${RED}❌ Comando inválido. Use: frontend, backend ou all${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Sincronização completa!${NC}"
echo ""
echo "📍 Status dos repositórios:"
echo "   • Frontend: https://comando-golgota.vercel.app"
echo "   • Backend: https://comando-golgota-backend.railway.app"
echo "   • Health: https://comando-golgota-backend.railway.app/health"