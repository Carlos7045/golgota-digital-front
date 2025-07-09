#!/bin/bash

echo "🚀 INICIANDO BUILD PARA VERCEL..."

# Definir variáveis
BUILD_DIR="dist"
API_DIR="api"
PUBLIC_DIR="public"

# Limpar diretórios
echo "🧹 Limpando diretórios..."
rm -rf $BUILD_DIR
rm -rf node_modules/.cache

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Build do frontend
echo "🔨 Compilando frontend..."
npm run build 2>&1 | grep -v "warnings"

# Build do backend
echo "🔧 Compilando backend..."
mkdir -p $BUILD_DIR

# Compilar arquivos TypeScript individuais
npx esbuild server/storage.ts --platform=node --packages=external --bundle --format=esm --outfile=$BUILD_DIR/storage.js
npx esbuild server/routes.ts --platform=node --packages=external --bundle --format=esm --outfile=$BUILD_DIR/routes.js  
npx esbuild server/asaas.ts --platform=node --packages=external --bundle --format=esm --outfile=$BUILD_DIR/asaas.js
npx esbuild server/db.ts --platform=node --packages=external --bundle --format=esm --outfile=$BUILD_DIR/db.js

# Copiar schema
echo "📋 Copiando schema..."
cp shared/schema.ts $BUILD_DIR/schema.ts

# Criar diretório de avatares
echo "📁 Configurando diretório de avatares..."
mkdir -p $BUILD_DIR/public/avatares

# Copiar avatares existentes se houver
if [ -d "$PUBLIC_DIR/avatars" ]; then
    cp -r $PUBLIC_DIR/avatars/* $BUILD_DIR/public/avatars/ 2>/dev/null || echo "⚠️  Nenhum avatar encontrado"
fi

# Verificar se arquivos foram criados
echo "✅ Verificando arquivos compilados..."
ls -la $BUILD_DIR/

echo "🎉 BUILD CONCLUÍDO COM SUCESSO!"
echo "📦 Arquivos prontos para deploy na Vercel"