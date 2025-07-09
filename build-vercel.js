import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando build para Vercel...');

try {
  // 1. Limpar diretório de build
  console.log('🧹 Limpando diretório de build...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // 2. Build do frontend com Vite
  console.log('🔨 Compilando frontend...');
  execSync('vite build', { stdio: 'inherit' });

  // 3. Build do backend com esbuild
  console.log('🔧 Compilando backend...');
  execSync('esbuild server/storage.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/storage.js', { stdio: 'inherit' });
  execSync('esbuild server/routes.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/routes.js', { stdio: 'inherit' });
  execSync('esbuild server/asaas.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/asaas.js', { stdio: 'inherit' });
  execSync('esbuild server/db.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/db.js', { stdio: 'inherit' });

  // 4. Criar diretório de avatares no build
  console.log('📁 Criando estrutura de diretórios...');
  const avatarsDir = path.join(__dirname, 'dist/public/avatars');
  if (!fs.existsSync(avatarsDir)) {
    fs.mkdirSync(avatarsDir, { recursive: true });
  }

  // 5. Copiar avatares existentes
  const publicAvatarsDir = path.join(__dirname, 'public/avatars');
  if (fs.existsSync(publicAvatarsDir)) {
    const avatars = fs.readdirSync(publicAvatarsDir);
    avatars.forEach(avatar => {
      fs.copyFileSync(
        path.join(publicAvatarsDir, avatar),
        path.join(avatarsDir, avatar)
      );
    });
    console.log(`📸 Copiados ${avatars.length} avatares`);
  }

  // 6. Copiar arquivos de schema e shared
  console.log('📋 Copiando arquivos de schema...');
  if (fs.existsSync('shared/schema.ts')) {
    fs.copyFileSync('shared/schema.ts', 'dist/schema.ts');
    fs.copyFileSync('shared/schema.ts', 'shared/schema.js');
  }

  console.log('✅ Build concluído com sucesso!');
  console.log('📦 Arquivos prontos para deploy na Vercel');

} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}