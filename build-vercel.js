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

  // 6. Copiar arquivos PWA para deploy
  console.log('📱 Copiando arquivos PWA...');
  const publicDir = path.join(__dirname, 'dist/public');
  
  // Copy favicon.ico
  const faviconSource = path.join(__dirname, 'public', 'favicon.ico');
  const faviconDest = path.join(publicDir, 'favicon.ico');
  if (fs.existsSync(faviconSource)) {
    fs.copyFileSync(faviconSource, faviconDest);
    console.log('✓ Favicon copied');
  }

  // Copy PWA files (manifest.json, service worker)
  const pwaFiles = ['manifest.json', 'sw.js'];
  pwaFiles.forEach(file => {
    const source = path.join(__dirname, 'public', file);
    const dest = path.join(publicDir, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
      console.log(`✓ ${file} copied`);
    }
  });

  // Copy icons directory for PWA
  const iconsSourceDir = path.join(__dirname, 'public', 'icons');
  const iconsDestDir = path.join(publicDir, 'icons');
  if (fs.existsSync(iconsSourceDir)) {
    fs.mkdirSync(iconsDestDir, { recursive: true });
    const iconFiles = fs.readdirSync(iconsSourceDir);
    iconFiles.forEach(iconFile => {
      const source = path.join(iconsSourceDir, iconFile);
      const dest = path.join(iconsDestDir, iconFile);
      fs.copyFileSync(source, dest);
    });
    console.log('✓ Icons directory copied');
  }

  // 7. Copiar arquivos de schema e shared
  console.log('📋 Copiando arquivos de schema...');
  if (fs.existsSync('shared/schema.ts')) {
    fs.copyFileSync('shared/schema.ts', 'dist/schema.ts');
    fs.copyFileSync('shared/schema.ts', 'shared/schema.js');
  }

  console.log('✅ Build concluído com sucesso!');
  console.log('📦 Arquivos prontos para deploy na Vercel');
  console.log('📱 PWA integrado: manifest.json, service worker e ícones incluídos');

} catch (error) {
  console.error('❌ Erro durante o build:', error);
  process.exit(1);
}